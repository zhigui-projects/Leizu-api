'use strict';

var util = require('util');
var query = require('./query');
const common = require('../../libraries/common');
var logger = require('../../libraries/log4js').getLogger('Join-Channel');
var Client = require('fabric-client');
const DbService = require('../db/dao');

/*
 * Have an organization join a channel
 */
var joinChannel = async function (channelName, org, peers) {
    var errorMessage = null;
    try {
        // first setup the client for this org
        let client = new Client();
        var ordererConfig = await DbService.getOrderer(org.consortium_id);
        var response = {peers: [], organizations: [ordererConfig.orderer._id, org._id]};
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);
        let orderer = await query.newOrderer(client, ordererConfig);
        let channel = client.newChannel(channelName);
        channel.addOrderer(orderer);

        let targets = [];
        if (peers) {
            for (let id of peers) {
                let peerConfig = await DbService.findPeerById(id);
                if (!peerConfig) continue;
                let peer = await query.newPeer(client, peerConfig);
                targets.push(peer);
                channel.addPeer(peer);
                response.peers.push(peerConfig._id);
            }
        } else {
            peers = await DbService.findPeersByOrgId(org._id, common.PEER_TYPE_PEER);
            if (peers) {
                for (let peerConfig of peers) {
                    let peer = await query.newPeer(client, peerConfig);
                    targets.push(peer);
                    channel.addPeer(peer);
                    response.peers.push(peerConfig._id);
                }
            }
        }
        if (targets.length === 0) {
            throw new Error('Not found peers in the organization.');
        }
        // next step is to get the genesis_block from the orderer,
        // the starting point for the channel that we want to join
        let request = {
            txId: client.newTransactionID(true) //get an admin based transactionID
        };
        let genesisBlock = await channel.getGenesisBlock(request);

        // tell each peer to join and wait 10 seconds
        // for the channel to be created on each peer
        var promises = [];
        // promises.push(new Promise(resolve => setTimeout(resolve, 10000)));

        let joinRequest = {
            targets: targets, //using the peer names which only is allowed when a connection profile is loaded
            txId: client.newTransactionID(true), //get an admin based transactionID
            block: genesisBlock
        };
        let joinPromise = channel.joinChannel(joinRequest);
        promises.push(joinPromise);
        let results = await Promise.all(promises);
        logger.debug(util.format('Join channel response: %j', results));

        // lets check the results of sending to the peers which is
        // last in the results array
        let peersResults = results.pop();
        // then each peer results
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
