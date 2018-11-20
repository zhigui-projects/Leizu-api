/**
 * Copyright 2018 zhigui Corp All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

var query = require('./query');
var logger = require('../../libraries/log4js').getLogger('Update-Channel');
var configtxlator = require('./configtxlator');
var Client = require('fabric-client');
var stringUtil = require('../../libraries/string-util');
var ConfigTxBuilder = require('./configtxgen');
const DbService = require('../db/dao');

async function updateAppChannel(channelName, org, orgId) {
    try {
        let client = new Client();
        let config = await DbService.findOrganizationById(orgId);
        var ordererConfig = await DbService.getOrderer(org.ConsortiumId);
        client.setAdminSigningIdentity(config.admin_key, config.admin_cert, config.msp_id);
        let orderer = await query.newOrderer(client, ordererConfig);
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
        //Add a new org, you should prepare a related msp for the target org first
        //Build a new organisation group for application group section
        var configtxgen = new ConfigTxBuilder(org);
        var configtx = Buffer.from(configtxgen.buildPrintOrg());
        let orgName = org.Organizations[0].Name;
        let orgBytes = await configtxlator.printOrg(orgName, configtx, '');
        let orgMsp = stringUtil.getMspId(orgName);
        updatedConfig.channel_group.groups.Application.groups[orgMsp] = JSON.parse(orgBytes);

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
}

async function updateSysChannel(org) {
    try {
        let client = new Client();
        var config = await DbService.getOrderer(org.ConsortiumId);
        client.setAdminSigningIdentity(config.orderer.admin_key, config.orderer.admin_cert, config.orderer.msp_id);
        let orderer = await query.newOrderer(client, config);
        let consortium = await DbService.getConsortiumById(org.ConsortiumId);
        let networkConfig = JSON.parse(consortium.network_config);
        let channelName = networkConfig.sysChannel;
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
        //Add a new org, you should prepare a related msp for the target org first
        //Build a new organisation group for application group section
        var configtxgen = new ConfigTxBuilder(org);
        var configtx = Buffer.from(configtxgen.buildPrintOrg());
        let orgName = org.Organizations[0].Name;
        let orgBytes = await configtxlator.printOrg(orgName, configtx, '');
        let orgMsp = stringUtil.getMspId(orgName);
        updatedConfig.channel_group.groups.Consortiums.groups.SampleConsortium.groups[orgMsp] = JSON.parse(orgBytes);

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
}

module.exports.updateAppChannel = updateAppChannel;
module.exports.updateSysChannel = updateSysChannel;
