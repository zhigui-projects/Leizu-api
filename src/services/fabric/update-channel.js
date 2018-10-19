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

var Client = require('fabric-client');
var log4js = require('log4js');
var logger = log4js.getLogger("Update-Channel");
logger.level = 'debug';
var Configtxlator = require('./tools/configtxlator');
var configtxlator = new Configtxlator();
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

var updateChannel = async (updateOpt, config) => {
    try {
        // first setup the client for this org
        let client = new Client();
        client.setAdminSigningIdentity(config.peerConfig.adminKey, config.peerConfig.adminCert, config.peerConfig.mspid);
        const channel_name = config.orderConfig.sysChannel;
        let sysChannel = client.newChannel(channel_name);
        let orderer = client.newOrderer(config.orderConfig.url, {
            'pem': config.orderConfig.pem,
            'ssl-target-name-override': config.orderConfig['server-hostname']
        });

        sysChannel.addOrderer(orderer);
        const config_envelope = await sysChannel.getChannelConfigFromOrderer();

        // we just need the config from the envelope and configtxlator works with bytes
        let original_config_proto = config_envelope.config.toBuffer();

        // lets get the config converted into JSON, so we can edit JSON to
        // make our changes
        let original_config_json = await configtxlator.decode(original_config_proto, 'common.Config');
        logger.info('Successfully decoded the current configuration config proto into JSON');
        logger.debug(' original_config_json :: %s', original_config_json);

        // make a copy of the original so we can edit it
        let updated_config_json = original_config_json;
        const updated_config = JSON.parse(updated_config_json);

        // now edit the config -- add one of the organizations
        if (updateOpt.opt === 'del') {
            delete updated_config.channel_group.groups.Application.groups[updateOpt.orgName];
        } else if (updateOpt.opt === 'add') {
            //Add a new org, you should prepare a related msp for the target org first
            //Build a new organisation group for application group section
            var mspid = config.addOrg.mspid;
            var mspObj = new MSP(config.addOrg);

            var builder = new ConfigBuilder();
            builder.addOrganization(mspid, mspid, mspObj.getMSP());
            let org_content = builder.buildApplicationGroup(false);

            updated_config.channel_group.groups.Application.groups[mspid] = org_content;
        } else if (updateOpt.opt === 'update') {
            updated_config.channel_group.groups.Orderer.values.BatchSize.value.max_message_count = 30;
        }

        updated_config_json = JSON.stringify(updated_config);
        logger.debug(' updated_config_json :: %s', updated_config_json);

        // lets get the updated JSON encoded
        let updated_config_proto = await configtxlator.encode(updated_config_json, 'common.Config');
        logger.debug('Successfully encoded the updated config from the JSON input');

        let update_delta = await configtxlator.computeDelta(original_config_proto, updated_config_proto, channel_name);
        logger.debug('Successfully had configtxlator compute the updated config object');

        // will have to now collect the signatures
        let signatures = []; //clear out the above
        // sign and collect signature
        signatures.push(client.signChannelConfig(update_delta));
        logger.debug('Successfully signed config update by org1');

        client._userContext = null;
        client.setAdminSigningIdentity(config.signOrg.adminKey, config.signOrg.adminCert, config.signOrg.mspid);
        logger.debug('Successfully got the fabric client for the organization Org2');
        signatures.push(client.signChannelConfig(update_delta));
        logger.debug('Successfully signed config update by org2');

        client._userContext = null;
        client.setAdminSigningIdentity(config.orderConfig.adminKey, config.orderConfig.adminCert, config.orderConfig.mspid);
        signatures.push(client.signChannelConfig(update_delta));
        logger.debug('Successfully signed config update by orderer');

        // build up the create request
        let request = {
            config: update_delta,
            signatures: signatures,
            name: channel_name,
            orderer: sysChannel.getOrderers()[0],
            txId: client.newTransactionID(true)
        };

        // this will send the update request to the orderer
        let result = await client.updateChannel(request);
        if (result.status && result.status === 'SUCCESS') {
            logger.info('Successfully updated the channel.');
            let response = {
                success: true,
                message: 'Channel \'' + channel_name + '\' updated Successfully'
            };
            return response;
        } else {
            logger.error('Failed to update the channel:', result);
            throw new Error('Failed to updated the channel \'' + channel_name + '\'');
        }
    } catch (err) {
        logger.error('Unexpected error ' + err.stack ? err.stack : err);
        throw err;
    }
};

exports.updateChannel = updateChannel;
