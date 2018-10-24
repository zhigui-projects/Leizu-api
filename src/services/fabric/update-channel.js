/**
 * Copyright 2018 zhigui Corp All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

/*
 *   This test case requires that the 'configtxlator' tool be running locally and on port 7059
 *   see:
 *   https://github.com/hyperledger/fabric/tree/master/examples/configtxupdate
 *
 *   This test case also requires two node packages to make it easier to make REST calls to
 *   the 'configtxlator'
 *        superagent
 *        superagent-promise
 */

var query = require('./query');
var logger = require('../../libraries/log4js').getLogger('Update-Channel');
var Client = require('fabric-client');
var configtxlator = require('./tools/configtxlator');
var ConfigBuilder = require('./tools/config-builder');
var MSP = require('./tools/msp-builder');

/*
 *  C H A N N E L  U P D A T E
 *
 *  - Get the current configuration of the channel by
 *    using the NodeSDK API getChannelConfig(). This
 *    will return a "ConfigEvelope" object.
 *  - From the "ConfigEvelope" object, save the this original
 *    "Config" object for later use.
 *  - Using the "configtxlator", decode the original "Config"
 *    into JSON. You may do this by using the calls as shown
 *    below or by using a tool like "curl".
 *  - Edit the "Config" JSON with the necessary changes to
 *    the configuration.
 *  - Using the "configtxlator", encode the updated "Config"
 *    JSON and save the returned updated "Config" object for
 *    later use.
 *  - Using the "configtxlator" to compute a "ConfigUpdate"
 *    object to be used for the channel update. This requires
 *    sending both the original and updated "Config" objects.
 *    Save the returned "ConfigUpdate" object for later use.
 *  - Using the NodeSDK, sign the "ConfigUpdate" object by
 *    all organizations.
 *  - Using the NodeSDK, update the channel by using the
 *    the "updateChannel" API with all the signatures and
 *    the "ConfigUpdate" object.
 */

module.exports.updateChannel = async (updateConfig, channelName, config) => {
    try {
        let client = new Client();
        client.setAdminSigningIdentity(config.peerConfig.adminKey, config.peerConfig.adminCert, config.peerConfig.mspid);
        let orderer = await query.newOrderer(client, config);
        let channel = client.newChannel(channelName);
        channel.addOrderer(orderer);
        const envelopeConfig = await channel.getChannelConfigFromOrderer();

        // we just need the config from the envelope and configtxlator works with bytes
        let originalConfigProto = envelopeConfig.config.toBuffer();

        // lets get the config converted into JSON, so we can edit JSON to
        // make our changes
        let originalConfigJson = await configtxlator.decode(originalConfigProto, 'common.Config');
        logger.debug('Successfully decoded the current configuration config proto into JSON');
        // logger.debug(' original_config_json :: %s', originalConfigJson);

        // make a copy of the original so we can edit it
        let updatedConfigJson = originalConfigJson;
        const updatedConfig = JSON.parse(updatedConfigJson);

        // now edit the config -- add one of the organizations
        if (updateConfig.opt === 'del') {
            delete updatedConfig.channel_group.groups.Application.groups[updateConfig.update];
        } else if (updateConfig.opt === 'add') {
            //Add a new org, you should prepare a related msp for the target org first
            //Build a new organisation group for application group section
            var mspid = updateConfig.update.mspid;
            var mspObj = new MSP(updateConfig.update);

            var builder = new ConfigBuilder();
            builder.addOrganization(mspid, mspid, mspObj.getMSP());
            let orgContent = builder.buildApplicationGroup(false);

            updatedConfig.channel_group.groups.Application.groups[mspid] = orgContent;
        } else if (updateConfig.opt === 'update') {
            updatedConfig.channel_group.groups.Orderer.values.BatchSize.value.max_message_count = updateConfig.update;
        }

        updatedConfigJson = JSON.stringify(updatedConfig);
        // logger.debug(' updated_config_json :: %s', updatedConfigJson);

        // lets get the updated JSON encoded
        let updatedConfigProto = await configtxlator.encode(updatedConfigJson, 'common.Config');
        logger.debug('Successfully encoded the updated config from the JSON input');

        let updateDelta = await configtxlator.computeDelta(originalConfigProto, updatedConfigProto, channelName);
        logger.debug('Successfully had configtxlator compute the updated config object');

        // will have to now collect the signatures
        let signatures = []; //clear out the above
        // sign and collect signature
        signatures.push(client.signChannelConfig(updateDelta));
        logger.debug('Successfully signed config update by org admin');

        // build up the create request
        let request = {
            config: updateDelta,
            signatures: signatures,
            name: channelName,
            orderer: channel.getOrderers()[0],
            txId: client.newTransactionID(true)
        };

        // this will send the update request to the orderer
        let result = await client.updateChannel(request);
        if (result.status && result.status === 'SUCCESS') {
            logger.info('Successfully updated the channel.');
            let response = {
                success: true,
                message: 'Channel \'' + channelName + '\' updated Successfully'
            };
            return response;
        } else {
            logger.error('Failed to update the channel:' + JSON.stringify(result));
            throw new Error('Failed to updated the channel \'' + channelName + '\':' + JSON.stringify(result));
        }
    } catch (err) {
        logger.error('Unexpected error ' + err.stack ? err.stack : err);
        throw err;
    }
};
