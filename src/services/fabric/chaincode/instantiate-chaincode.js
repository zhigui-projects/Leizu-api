/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const util = require('util');
const query = require('../query');
const common = require('../../../libraries/common');
const logger = require('../../../libraries/log4js').getLogger('Instantiate-chaincode');
const Client = require('fabric-client');
const DbService = require('../../db/dao');

module.exports.instantiateChaincode = async function (peers, channelName, chaincodeName, chaincodeVersion,
                                                      functionName, chaincodeType, args, org, endorsementPolicy) {
    var error_message = null;
    try {
        let client = new Client();
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);
        var channel = client.newChannel(channelName);
        const orderer = await DbService.findOrdererByConsortium(org.consortium_id);
        const newOrderer = await query.newOrderer(client, orderer);
        channel.addOrderer(newOrderer);

        var tx_id = client.newTransactionID(true);
        var deployId = tx_id.getTransactionID();

        let targets = [];
        if (peers && peers.length > 0) {
            for (let id of peers) {
                let peer = await DbService.findPeerById(id);
                if (!peer) continue;
                let newPeer = await query.newPeer(client, peer, org);
                channel.addPeer(newPeer);
                targets.push(newPeer);
                break;
            }
        } else {
            peers = await DbService.findPeersByOrgId(org._id, common.PEER_TYPE_PEER);
            if (peers) {
                for (let peer of peers) {
                    let newPeer = await query.newPeer(client, peer, org);
                    channel.addPeer(newPeer);
                    targets.push(newPeer);
                    break;
                }
            }
        }
        if (targets.length === 0) {
            throw new Error('Not found peers in the organization.');
        }

        // send proposal to endorser
        var request = {
            targets: targets,
            chaincodeId: chaincodeName,
            chaincodeType: chaincodeType,
            chaincodeVersion: chaincodeVersion,
            args: args,
            txId: tx_id
        };
        if (functionName) request.fcn = functionName;
        if (endorsementPolicy) request['endorsement-policy'] = endorsementPolicy;

        let results = await channel.sendInstantiateProposal(request, 90000);
        var proposalResponses = results[0];
        var proposal = results[1];

        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.debug('Instantiate proposal was good');
            } else {
                if (proposalResponses[i].details) {
                    error_message = 'Instantiate proposal was bad, ' + proposalResponses[i].details;
                } else {
                    error_message = 'Instantiate proposal was bad, ' + proposalResponses[i].toString();
                }
                logger.error(error_message);
            }
            all_good = all_good & one_good;
        }

        if (all_good) {
            // wait for the channel-based event hub to tell us that the
            // instantiate transaction was committed on the peer
            let promises = [];
            let eventHubs = channel.getChannelEventHubsForOrg();
            eventHubs.forEach((eh) => {
                let instantiateEventPromise = new Promise((resolve, reject) => {
                    let eventTimeout = setTimeout(() => {
                        let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
                        logger.error(message);
                        eh.disconnect();
                    }, 60000);
                    eh.registerTxEvent(deployId, (tx, code, block_num) => {
                            logger.debug('The chaincode instantiate transaction has been committed on peer %s', eh.getPeerAddr());
                            clearTimeout(eventTimeout);
                            if (code !== 'VALID') {
                                let message = 'The chaincode instantiate transaction was invalid, code:' + code;
                                logger.error(message);
                                reject(new Error(message));
                            } else {
                                let message = util.format('The chaincode instantiate transaction was valid, transaction %s in block %s', tx, block_num);
                                logger.debug(message);
                                resolve(message);
                            }
                        }, (err) => {
                            clearTimeout(eventTimeout);
                            reject(err);
                        },
                        // the default for 'unregister' is true for transaction listeners
                        // so no real need to set here, however for 'disconnect'
                        // the default is false as most event hubs are long running
                        // in this use case we are using it only once
                        {unregister: true, disconnect: true}
                    );
                    eh.connect();
                });
                promises.push(instantiateEventPromise);
            });

            var orderer_request = {
                txId: tx_id,
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            var sendPromise = channel.sendTransaction(orderer_request);
            promises.push(sendPromise);
            let results = await Promise.all(promises);
            // orderer results are last in the results
            let response = results.pop();
            if (response.status === 'SUCCESS') {
                logger.debug('Successfully sent transaction to the orderer.');
            } else {
                error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
                logger.debug(error_message);
            }
        }
    } catch (error) {
        logger.error(error.stack ? error.stack : error);
        error_message = error.message;
    }

    if (!error_message) {
        let message = util.format('Successfully instantiate chaincode in organization \'%s\' to the ' +
            'channel \'%s\'', org.name, channelName);
        logger.info(message);
        return message;
    } else {
        throw new Error(error_message);
    }
};
