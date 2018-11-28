/**
 * Copyright 2018 zhigui Corp All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const query = require('./query');
const logger = require('../../libraries/log4js').getLogger('Update-Channel');
const configtxlator = require('./configtxlator');
const Client = require('fabric-client');
const stringUtil = require('../../libraries/string-util');
const ConfigTxBuilder = require('./configtxgen');
const utils = require('../../libraries/utils');
const config = require('../../env');
const DbService = require('../db/dao');
const common = require('../../libraries/common');

async function updateAppChannel(channelId, orgId, org) {
    try {
        let channelInfo = await DbService.getChannelById(channelId);
        if (!channelInfo) {
            throw new Error('The channelId does not exist.');
        }
        if (!channelInfo.orgs || channelInfo.orgs.length === 0) {
            throw new Error('Invalid channel that not found any org');
        }
        let channelName = channelInfo.name;
        var channel, envelopeConfig, ordererConfig;
        let findPeer = false;
        let client = new Client();
        // select discovery peer
        for (let id of channelInfo.orgs) {
            if (findPeer === true) break;
            let peers = await DbService.findPeersByOrgId(id);
            if (!peers || peers.length === 0) continue;
            let organization = await DbService.findOrganizationById(id);
            client.setAdminSigningIdentity(organization.admin_key, organization.admin_cert, organization.msp_id);
            for (let peerConfig of peers) {
                if (peerConfig.type === common.PEER_TYPE_ORDER) {
                    let orderer = await query.newOrderer(client, {
                        url: utils.getUrl(peerConfig.location, config.network.orderer.tls),
                        'server-hostname': peerConfig.name,
                        orderer: organization
                    });
                    channel = client.newChannel(channelName);
                    channel.addOrderer(orderer);
                    envelopeConfig = await channel.getChannelConfigFromOrderer();
                    findPeer = true;
                    ordererConfig = organization;
                    break;
                }
                // else {
                //     let peer = await query.newPeer(client, peerConfig);
                //     let channel = client.newChannel(channelName);
                //     channel.addPeer(peer);
                //     envelopeConfig = await channel.getChannelConfig();
                //     findPeer = true;
                //     break;
                // }
            }
        }
        if (findPeer === false) {
            throw new Error('Not found any peer on the channel.');
        }

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
        for (let id of channelInfo.orgs) {
            let organization = await DbService.findOrganizationById(id);
            client._userContext = null;
            client.setAdminSigningIdentity(organization.admin_key, organization.admin_cert, organization.msp_id);
            signatures.push(client.signChannelConfig(updateDelta));
        }
        logger.debug('Successfully signed config update by org admin');

        client._userContext = null;
        client.setAdminSigningIdentity(ordererConfig.admin_key, ordererConfig.admin_cert, ordererConfig.msp_id);

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

async function updateSysChannel(options) {
    try {
        let client = new Client();
        const orderer = await DbService.findOrdererByConsortium(options.ConsortiumId);
        const org = await DbService.findOrganizationById(orderer.org_id);
        client.setAdminSigningIdentity(org.admin_key, org.admin_cert, org.msp_id);
        let newOrderer = await query.newOrderer(client, orderer, org);
        let consortium = await DbService.getConsortiumById(options.ConsortiumId);
        let networkConfig = JSON.parse(consortium.network_config);
        let channelName = networkConfig.sysChannel;
        let channel = client.newChannel(channelName);
        channel.addOrderer(newOrderer);
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
        var configtxgen = new ConfigTxBuilder(options);
        var configtx = Buffer.from(configtxgen.buildPrintOrg());
        let orgName = options.Organizations[0].Name;
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
