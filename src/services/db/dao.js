'use strict';

const uuid = require('uuid/v1');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Consortium = require('../../models/consortium');

module.exports = class DbService {

    static async getChannels() {
        let channels = await Channel.find();
        return channels;
    }

    static async getChannelById(id) {
        let channel = await Channel.findById(id);
        return channel;
    }

    static async addChannel(dto) {
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = dto.name;
        channel.consortium_id = dto.consortiumId;
        channel = await channel.save();
        return channel;
    }

    static async getConsortiums() {
        let consortiums = await Consortium.find();
        return consortiums;
    }

    static async getConsortiumById(id) {
        let consortium = await Consortium.findById(id);
        return consortium;
    }

    static async addConsortium(dto) {
        let consortium = new Consortium();
        consortium.name = dto.name;
        consortium.uuid = uuid();
        consortium.network_config = JSON.stringify(dto.config);
        consortium = await consortium.save();
        return consortium;
    }

    static async findPeers() {
        let peers = await Peer.find();
        return peers;
    }

    static async findPeerById(id) {
        let peer = await Peer.findById(id);
        return peer;
    }

    static async findPeersByOrgId(orgId) {
        let peers = await Peer.find({org_id: orgId});
        return peers;
    }

    static async countPeersByOrg(orgId) {
        let data = Peer.aggregate([
            {$match: {"org_id": {$in: orgId}}},
            {
                $group: {
                    _id: "$org_id",
                    total: {$sum: 1}
                }
            }
        ]);
        return data;
    }

    static async findOrganizations() {
        let organizations = Organization.find();
        return organizations;
    }

    static async getOrganizationsByIds(orgIds) {
        let where = {};
        if (orgIds && orgIds.length > 0) {
            where = {_id: orgIds};
        }
        let organizations = Organization.find(where);
        return organizations;
    }

    static async findOrganizationById(id) {
        let organization = Organization.findById(id);
        return organization;
    }

    static async addOrganization(dto) {
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.name;
        organization.consortium_id = dto.consortiumId;
        organization = await organization.save();
        return organization;
    }
};