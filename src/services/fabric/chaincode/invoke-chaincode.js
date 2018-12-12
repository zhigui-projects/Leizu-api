/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const util = require('util');
const query = require('../query');
const common = require('../../../libraries/common');
const logger = require('../../../libraries/log4js').getLogger('Invoke-chaincode');
const Client = require('fabric-client');
const DbService = require('../../db/dao');

module.exports.invokeChaincode = async function (peers, org, channelName, chaincodeName, fcn, args) {

    var errMessage = null;
    var strTxId = null;
    try {
        let client = new Client();
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);
        let channel = client.newChannel(channelName);
        const orderer = await DbService.findOrdererByConsortium(org.consortium_id);
        const newOrderer = await query.newOrderer(client, orderer);
        channel.addOrderer(newOrderer);

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

        let tx_id = client.newTransactionID(true);
        strTxId = tx_id.getTransactionID();

        // send proposal to endorser
        var request = {
            targets: targets,
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        let results = await channel.sendTransactionProposal(request);

        var proposalResponses = results[0];
        var proposal = results[1];

        var one_good = false;
        var validPeers = [];
        for (var i in proposalResponses) {
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                validPeers.push(targets[i]);
                logger.info('invoke chaincode proposal was good');
            } else {
                if (proposalResponses[i].details) {
                    logger.error(util.format('invoke chaincode proposal was bad on %s, %s', targets[i], proposalResponses[i].details));
                } else {
                    logger.error(util.format('invoke chaincode proposal was bad on %s, %s', targets[i], proposalResponses[i].toString()));
                }
            }
        }

        if (one_good) {
            var promises = [];
            let eventHubs = validPeers.map(peer => channel.newChannelEventHub(peer));
            eventHubs.forEach((eh) => {
                let invokeEventPromise = new Promise((resolve, reject) => {
                    let event_timeout = setTimeout(() => {
                        let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
                        logger.error(message);
                        eh.disconnect();
                    }, 3000);
                    eh.registerTxEvent(strTxId, (tx, code, block_num) => {
                            logger.debug('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
                            logger.info('Transaction %s has status of %s in blocl %s', tx, code, block_num);
                            clearTimeout(event_timeout);
                            if (code !== 'VALID') {
                                let message = 'The invoke chaincode transaction was invalid, code:' + code;
                                logger.error(message);
                                reject(new Error(message));
                            } else {
                                let message = util.format('The invoke chaincode transaction was valid, transaction %s in block %s', tx, block_num);
                                logger.debug(message);
                                resolve(message);
                            }
                        }, (err) => {
                            clearTimeout(event_timeout);
                            logger.error(err);
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
                promises.push(invokeEventPromise);
            });

            var orderer_request = {
                txId: tx_id,
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            var sendPromise = channel.sendTransaction(orderer_request);
            promises.push(sendPromise);
            let results = await Promise.all(promises);
            //  orderer results are last in the results
            let response = results.pop();
            if (response.status === 'SUCCESS') {
                logger.info('Successfully sent transaction to the orderer.');
            } else {
                errMessage = util.format('Failed to order the transaction. Error code: %s', response.status);
                logger.debug(errMessage);
            }

            // now see what each of the event hubs reported
            for (let i in results) {
                let eventHubResult = results[i];
                logger.debug('Event results for event hub :%s', eventHubs[i].getPeerAddr());
                if (typeof eventHubResult === 'string') {
                    logger.debug(eventHubResult);
                } else {
                    if (!errMessage) errMessage = eventHubResult.toString();
                    logger.debug(eventHubResult.toString());
                }
            }
        } else {
            errMessage = 'invoke transaction proposalResponse all bad';
        }
    } catch (error) {
        logger.error(error.stack ? error.stack : error);
        errMessage = error.message;
    }

    if (!errMessage) {
        let message = util.format(
            'Successfully invoked the chaincode \'%s\' to the channel \'%s\' for transaction ID: %s',
            chaincodeName, channelName, strTxId);
        logger.info(message);
        return strTxId;
    } else {
        throw new Error(errMessage);
    }
};
