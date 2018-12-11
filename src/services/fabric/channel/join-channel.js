/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const util = require('util');
const query = require('../query');
const common = require('../../../libraries/common');
const logger = require('../../../libraries/log4js').getLogger('Join-Channel');
const Client = require('fabric-client');
const DbService = require('../../db/dao');

const joinChannel = async function (channelName, org, peers) {
    let errorMessage = null;
    const response = {peers: [], organizations: [org._id]};
    try {
        let client = new Client();
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);
        let orderer = await DbService.findOrdererByConsortium(org.consortium_id);
        let newOrderer = await query.newOrderer(client, orderer);
        let channel = client.newChannel(channelName);
        channel.addOrderer(newOrderer);

        let targets = [];
        if (peers) {
            for (let id of peers) {
                let peer = await DbService.findPeerById(id);
                if (!peer) continue;
                let newPeer = await query.newPeer(client, peer, org);
                targets.push(newPeer);
                channel.addPeer(newPeer);
                response.peers.push(peer._id);
            }
        } else {
            peers = await DbService.findPeersByOrgId(org._id, common.PEER_TYPE_PEER);
            if (peers) {
                for (let peer of peers) {
                    let newPeer = await query.newPeer(client, peer, org);
                    targets.push(newPeer);
                    channel.addPeer(newPeer);
                    response.peers.push(peer._id);
                }
            }
        }
        if (targets.length === 0) {
            throw new Error('Not found peers in the organization.');
        }

        let genesisBlock = await channel.getGenesisBlock({txId: client.newTransactionID(true)});

        let promises = [];
        let joinRequest = {
            targets: targets,
            txId: client.newTransactionID(true),
            block: genesisBlock
        };
        let joinPromise = channel.joinChannel(joinRequest);
        promises.push(joinPromise);
        let results = await Promise.all(promises);
        logger.debug(util.format('Join channel response: %j', results));

        let peersResults = results.pop();
        for (let i in peersResults) {
            let peerResult = peersResults[i];
            if (peerResult.response && peerResult.response.status === 200) {
                logger.info('Successfully joined peer to the channel %s', channelName);
            } else {
                let message = util.format('Failed to joined peer to the channel %s', channelName);
                errorMessage = message;
                logger.error(message);
            }
        }
    } catch (error) {
        logger.error('Failed to join channel due to error: ' + error.stack ? error.stack : error);
        errorMessage = error.toString();
    }

    if (!errorMessage) {
        logger.info('Successfully joined peers in organization  to the channel:%s', channelName);
        return response;
    } else {
        let message = util.format('Failed to join all peers to channel. cause:%s', errorMessage);
        logger.error(message);
        throw new Error(message);
    }
};

exports.joinChannel = joinChannel;
