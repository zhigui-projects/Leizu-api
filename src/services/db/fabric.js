'use strict';

const uuid = require('uuid/v1');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Orderer = require('../../models/orderer');
const Peer = require('../../models/peer');

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
        channel.name = dto;
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
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.id;
        organization.consortium_id = this.consortiumId;
        try {
            organization = await organization.save();
            return organization;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }
    
    async findOrganizationIdByName(name){
        try {
            let organization = await Organization.findOne({name: name});
            return organization ? organization._id : null;
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

    async addOrdererPeer(dto) {
        let peer = new Peer();
        peer.uuid = uuid();
        peer.location = dto.host + dto.port;
        peer.type = 1;
        peer.org_id =  await this.findOrganizationIdByName(dto.mspid);
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addPeer(dto) {
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = dto.endpoint.slice(0, dto.endpoint.indexOf(common.SEPARATOR_DOT));
        peer.location = dto.endpoint;
        peer.org_id =  await this.findOrganizationIdByName(dto.mspid);
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async handleDiscoveryResults(channelName, results) {
        let result = {
            organizations: [],
            orderers: [],
            peers: [],
        };
        if (results) {
            for (let index = 0; index < results.organizations.length; index++) {
                let organization = await this.addOrganization(results.organizations[index]);
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
        let channelDb = await this.addChannel(channelName, result);
        result.channel_id = channelDb._id;
        await this.updateChannel(channelDb._id, result);

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
