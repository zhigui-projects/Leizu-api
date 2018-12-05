/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

var util = require('util');
const query = require('./query');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const logger = require('../../libraries/log4js').getLogger('Install-chaincode');
const Client = require('fabric-client');
const DbService = require('../db/dao');

module.exports.installChaincode = async function (peers, chaincodeName, chaincodePath,
                                                  chaincodeVersion, chaincodeType, org) {
    utils.setupChaincodeDeploy();
    try {
        let client = new Client();
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);

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
        if (targets.length === 0) {
            throw new Error('Not found peers in the organization.');
        }

        let request = {
            targets: targets,
            chaincodePath: chaincodePath,
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion,
            chaincodeType: chaincodeType
        };
        let results = await client.installChaincode(request);
        let proposalResponses = results[0];
        var responses = [];
        let allGood = true;
        for (var i in proposalResponses) {
            let oneGood = false;
            let message;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                oneGood = true;
                message = util.format('"%s" successfully installed chaincode "%s:%s"', org.name, chaincodeName, chaincodeVersion);
                logger.debug(message);
            } else {
                message = util.format('"%s" failed to install chaincode, due to', org.name,
                    proposalResponses[i].message ? proposalResponses[i].message : proposalResponses[i]);
            }
            allGood = allGood & oneGood;
            responses.push(message);
        }
        if (allGood) {
            logger.info('Successfully install chaincode');
        } else {
            throw new Error(JSON.stringify(responses));
        }
    } catch (error) {
        logger.error('Failed to install due to error: ', error.stack ? error.stack : error);
        throw error;
    }
};
