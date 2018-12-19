/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const fs = require('fs');
const uuid = require('uuid/v1');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Orderer = require('../../models/orderer');
const Peer = require('../../models/peer');
const stringUtil = require('../../libraries/string-util');
const CredentialHelper = require('../fabric/tools/credential-helper');
const DbService = require('./dao');
const configtxlator = require('../fabric/tools/configtxlator');

module.exports = class FabricService {

    constructor(consortiumId) {
        this.consortiumId = consortiumId;
    }

    static getInstance(consortiumId) {
        return new FabricService(consortiumId);
    }

    async findChannel(filter) {
        let condition = filter || {};
        try {
            let channel = await Channel.findOne(condition);
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addChannel(dto) {
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = dto.name;
        channel.consortium_id = this.consortiumId;
        channel.orgs = dto.orgIds;
        if (dto.peers) {
            channel.peers = dto.peers;
        }
        if (dto.configuration && dto.configuration.config) {
            channel.configuration = JSON.stringify(dto.configuration.config.channel_group);
        }
        try {
            channel = await channel.save();
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    static async findChannelAndUpdate(channelId, update) {
        try {
            let orgs = update.orgs;
            let peers = update.peers;
            let oldChannel = await Channel.findById(channelId);
            if (!oldChannel) {
                throw new Error('The channel does not exist: ' + channelId);
            }
            if (oldChannel.orgs && oldChannel.orgs.length > 0) {
                orgs = orgs ? orgs.concat(oldChannel.orgs) : oldChannel.orgs;
            }
            if (oldChannel.peers && oldChannel.peers.length > 0) {
                peers = peers ? peers.concat(oldChannel.peers) : oldChannel.peers;
            }
            let data = {};
            if (orgs) data.orgs = orgs;
            if (peers) data.peers = peers;
            let channel = await Channel.findByIdAndUpdate(channelId, data);
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }


    async addOrganization(dto) {
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.name;
        organization.msp_id = dto.id;
        organization.consortium_id = this.consortiumId;
        organization.admin_key = dto.adminKey;
        organization.admin_cert = dto.admins;
        organization.root_cert = dto.rootCerts;
        organization.msp_path = dto.mspPath;
        organization.type = dto.type;
        try {
            organization = await organization.save();
            return organization;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async storeCredentials(dto) {
        try {
            let orgDto = {
                orgName: dto.name,
                consortiumId: this.consortiumId,
                adminKey: dto.adminKey,
                adminCert: dto.admins,
                signcerts: dto.admins,
                rootCert: dto.rootCerts,
                tlsRootCert: dto.rootCerts
            };

            dto.mspPath = await CredentialHelper.storeOrgCredentials(orgDto);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrderer(dto) {
        let orderer = new Orderer();
        orderer.uuid = uuid();
        orderer.location = dto.host + dto.port;
        try {
            orderer = await orderer.save();
            return orderer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async findPeerByName(name) {
        try {
            let peer = await Peer.findOne({consortium_id: this.consortiumId, name: name});
            return peer ? peer : null;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrdererPeer(networkConfig, dto) {
        let existedPeer = await this.findPeerByName(dto.host);
        if (existedPeer) return existedPeer;
        FabricService.getPeerUrl(networkConfig, dto);
        let peer = new Peer();
        peer.uuid = uuid();
        peer.location = dto.location || dto.host + common.SEPARATOR_COLON + dto.port;
        peer.name = dto.host;
        peer.consortium_id = this.consortiumId;
        peer.type = common.PEER_TYPE_ORDER;
        let organization = await DbService.findOrganizationByName(this.consortiumId, stringUtil.getOrgName(dto.mspid));
        if (organization) {
            peer.org_id = organization._id;
            await DbService.findOrganizationAndUpdate(organization._id, {type: common.PEER_TYPE_ORDER});
        }
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addPeer(networkConfig, dto) {
        let name = dto.endpoint.slice(0, dto.endpoint.indexOf(common.SEPARATOR_COLON));
        dto.host = name;
        let existedPeer = await this.findPeerByName(name);
        if (existedPeer) return existedPeer;
        FabricService.getPeerUrl(networkConfig, dto);
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = name;
        peer.location = dto.location || dto.endpoint;
        peer.consortium_id = this.consortiumId;
        let organization = await DbService.findOrganizationByName(this.consortiumId, stringUtil.getOrgName(dto.mspid));
        if (organization) peer.org_id = organization._id;
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    static async getOrgAdminKey(networkConfig, org) {
        for (let item of networkConfig.orgs) {
            if (item.mspId === org.id) {
                org.adminKey = item.signIdentity.adminKey;
                return;
            }
        }
        logger.warn('Not provide sign identity private key for ' + org.id);
    }

    static async addCertAuthority(networkConfig, org) {
        for (let item of networkConfig.orgs) {
            if (item.mspId === org.msp_id) {
                let ca = item.ca;
                ca.orgId = org._id;
                ca.consortiumId = org.consortium_id;
                return DbService.addCertAuthority(ca);
            }
        }
    }

    static getPeerUrl(networkConfig, dto) {
        for (let item of networkConfig.orgs) {
            for (let peer of item.peers) {
                if (peer['server-hostname'] === dto.host) {
                    dto.location = peer.url.split('://')[1];
                    return;
                }
            }
        }
        logger.warn('Not provide peer url for ' + dto.host);
    }

    async handleDiscoveryResults(networkConfig, channelInfo, results) {
        let result = {
            organizations: [],
            orderers: [],
            peers: [],
        };
        if (results) {
            for (let index = 0; index < results.organizations.length; index++) {
                let org = results.organizations[index];
                org.name = stringUtil.getOrgName(org.id);
                let organization = await DbService.findOrganizationByName(this.consortiumId, org.name);
                if (organization) continue;
                await FabricService.getOrgAdminKey(networkConfig, org);
                await this.storeCredentials(org);
                organization = await this.addOrganization(org);
                await FabricService.addCertAuthority(networkConfig, organization);
                result.organizations.push(organization);
                // transfer certs file to configtxlator for update channel
                await configtxlator.upload(organization.consortium_id, organization.name, `${organization.msp_path}.zip`);
                fs.unlinkSync(`${organization.msp_path}.zip`);
            }
            for (let index = 0; index < results.orderers.length; index++) {
                let orderer = await this.addOrdererPeer(networkConfig, results.orderers[index]);
                result.orderers.push(orderer);
            }
            for (let index = 0; index < results.peers.length; index++) {
                let peer = await this.addPeer(networkConfig, results.peers[index]);
                result.peers.push(peer);
            }
        }
        let channelDto = {
            name: channelInfo.channel_id,
            orgIds: result.organizations.map(org => org._id),
            peers: result.peers.map(peer => peer._id),
            configuration: channelInfo.channelConfig
        };
        let channelDb = await this.addChannel(channelDto);
        result.channel_id = channelDb._id;

        return result;
    }

};
