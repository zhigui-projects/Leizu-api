'use strict';

const uuid = require('uuid/v1');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Orderer = require('../../models/orderer');
const Peer = require('../../models/peer');
const stringUtil = require('../../libraries/string-util');
const CredentialHelper = require('../fabric/credential-helper');

module.exports = class FabricService {

    constructor(consortiumId) {
        this.isFabric = true;
        this.consortiumId = consortiumId;
    }

    static getInstance(consortiumId) {
        let fabricService = new FabricService(consortiumId);
        return fabricService;
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

    async addChannel(dto, result) {
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = dto.name;
        if (dto.configuration && dto.configuration.config) {
            channel.configuration = JSON.stringify(dto.configuration.config.channel_group);
        }
        channel.consortium_id = this.consortiumId;
        channel.orgs = result.organizations.map(org => org._id);
        channel.peers = result.peers.map(peer => peer._id);
        try {
            channel = await channel.save();
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrganization(dto) {
        let existedOrganization = await this.findOrganizationByName(dto.name);
        if (existedOrganization) return existedOrganization;
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.name;
        organization.msp_id = dto.id;
        organization.consortium_id = this.consortiumId;
        organization.admin_cert = dto.admins;
        organization.root_cert = dto.rootCerts;
        organization.msp_path = dto.mspPath;
        try {
            organization = await organization.save();
            return organization;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async storeCredentials(dto) {
        let orgName = stringUtil.getOrgName(dto.id);
        dto.name = orgName;
        let existedOrganization = await this.findOrganizationByName(orgName);
        if (existedOrganization) return existedOrganization;
        try {
            let orgDto = {
                orgName: orgName,
                consortiumId: this.consortiumId,
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

    async findOrganizationByName(name) {
        try {
            let organization = await Organization.findOne({name: name});
            return organization;
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
            let peer = await Peer.findOne({name: name});
            return peer ? peer : null;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrdererPeer(dto) {
        let existedPeer = await this.findPeerByName(dto.host);
        if (existedPeer) return existedPeer;
        let peer = new Peer();
        peer.uuid = uuid();
        peer.location = dto.host + common.SEPARATOR_COLON + dto.port;
        peer.name = dto.host;
        peer.consortium_id = this.consortiumId;
        peer.type = 1;
        let organization = await this.findOrganizationByName(stringUtil.getOrgName(dto.mspid));
        if (organization) peer.org_id = organization._id;
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addPeer(dto) {
        let name = dto.endpoint.slice(0, dto.endpoint.indexOf(common.SEPARATOR_COLON));
        let existedPeer = await this.findPeerByName(name);
        if (existedPeer) return existedPeer;
        let peer = new Peer();
        peer.uuid = uuid();
        peer.consortium_id = this.consortiumId;
        peer.name = name;
        peer.location = dto.endpoint;
        peer.consortium_id = this.consortiumId;
        let organization = await this.findOrganizationByName(stringUtil.getOrgName(dto.mspid));
        if (organization) peer.org_id = organization._id;
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async handleDiscoveryResults(channelInfo, results) {
        let result = {
            organizations: [],
            orderers: [],
            peers: [],
        };
        if (results) {
            for (let index = 0; index < results.organizations.length; index++) {
                let org = results.organizations[index];
                await this.storeCredentials(org);
                let organization = await this.addOrganization(org);
                result.organizations.push(organization);
            }
            for (let index = 0; index < results.orderers.length; index++) {
                let orderer = await this.addOrdererPeer(results.orderers[index]);
                result.orderers.push(orderer);
            }
            for (let index = 0; index < results.peers.length; index++) {
                let peer = await this.addPeer(results.peers[index]);
                result.peers.push(peer);
            }
        }
        let channelDto = {
            name: channelInfo.channel_id,
            configuration: channelInfo.channelConfig
        };
        let channelDb = await this.addChannel(channelDto, result);
        result.channel_id = channelDb._id;

        return result;
    }

    async updateChannel(channelId, mapData) {
        let peerIds = [];
        let orgIds = [];

        if (mapData.peers) {
            for (let peer of mapData.peers) {
                peerIds.push(peer._id);
            }
        }

        if (mapData.orderers) {
            for (let orderer of mapData.orderers) {
                peerIds.push(orderer._id);
            }
        }

        if (mapData.organizations) {
            for (let organization of mapData.organizations) {
                orgIds.push(organization._id);
            }
        }
        let updateItems = {
            peers: peerIds,
            orgs: orgIds
        };
        await Channel.findByIdAndUpdate(channelId, updateItems);
    }
};
