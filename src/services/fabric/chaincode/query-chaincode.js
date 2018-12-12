/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const query = require('../query');
const common = require('../../../libraries/common');
const logger = require('../../../libraries/log4js').getLogger('Query-chaincode');
const Client = require('fabric-client');
const DbService = require('../../db/dao');

module.exports.queryChaincode = async function (peers, org, channelName, chaincodeName, fcn, args) {
    try {
        let client = new Client();
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);
        let channel = client.newChannel(channelName);

        let targets = [];
        if (peers && peers.length > 0) {
            for (let id of peers) {
                let peer = await DbService.findPeerById(id);
                if (!peer) continue;
                let newPeer = await query.newPeer(client, peer, org);
                targets.push(newPeer);
            }
        } else {
            peers = await DbService.findPeersByOrgId(org._id, common.PEER_TYPE_PEER);
            if (peers) {
                for (let peer of peers) {
                    let newPeer = await query.newPeer(client, peer, org);
                    targets.push(newPeer);
                }
            }
        }

        let request = {
            targets: targets,
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args
        };
        let responsePayloads = await channel.queryByChaincode(request, true);
        return compareQueryResponseResults(responsePayloads, targets);
    } catch (error) {
        logger.error(error.stack ? error.stack : error);
        throw error;
    }
};

function compareQueryResponseResults(responsePayloads, targets) {
    if (!responsePayloads || responsePayloads.length === 0) {
        throw new Error('responsePayloads is null');
    }
    if (!Array.isArray(responsePayloads)) {
        throw new Error('responsePayloads must be an array of Objects');
    }

    let firstOne = null;
    for (let i = 0; i < responsePayloads.length; i++) {
        if (Buffer.isBuffer(responsePayloads[i])) {
            logger.info('compareQueryResponseResults - payloads was good on %s, payload:%s', targets[i], responsePayloads[i]);
            if (firstOne) {
                if (!responsePayloads[i].equals(firstOne)) {
                    logger.error('compareQueryResponseResults - payloads do not match index=%s, [%s:%s]',
                        i, responsePayloads[i].toString(), firstOne.toString());
                    throw new Error('compareQueryResponseResults - payloads do not match');
                }
            } else {
                firstOne = responsePayloads[i];
            }
        } else {
            logger.error('compareQueryResponseResults - payloads was bad on %s, payload:%s', targets[i], responsePayloads[i]);
        }
    }

    if (firstOne) {
        return firstOne.toString();
    } else {
        throw new Error('compareQueryResponseResults - payloads was all bad');
    }
}
