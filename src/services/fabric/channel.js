'use strict';

const DbService = require('../db/dao');
const CreateChannel = require('./create-channel');
const UpdateChannel = require('./update-channel');
const common = require('../../libraries/common');
const stringUtil = require('../../libraries/string-util');

module.exports = class ChannelService {
    constructor(organizationId, channelId) {
        this._organization_id = organizationId;
        this._organization_name = '';
        this._network_config = null;
        this._channel_name = channelId;
        this._consortium_id = '';
        this._consortium_name = '';
        this._anchor_peers = [];
    }

    async loadConfigFrmDB() {
        try {
            let organizations = await DbService.getOrganizationsByIds(this._organization_id);
            if (!organizations) {
                throw new Error('The organization does not exist.');
            }
            this._organization_name = organizations[0].name;
            let consortium = await DbService.getConsortiumById(organizations[0].consortium_id);
            if (consortium) {
                if (consortium.synced) {
                    this._network_config = JSON.parse(consortium.network_config);
                    this._consortium_id = organizations[0].consortium_id.toString();
                    this._consortium_name = consortium.name;
                } else {
                    throw new Error('The consortium does not sync.');
                }
            } else {
                throw new Error('The consortium does not exist.');
            }

            let anchorPeer = await this.getOrgAnchorPeers();
            this._anchor_peers = anchorPeer;

        } catch (e) {
            throw e;
        }
    }

    static async getInstance(organizationId, channelId) {
        try {
            let channelService = new ChannelService(organizationId, channelId);
            await channelService.loadConfigFrmDB();
            return channelService;
        } catch (e) {
            throw e;
        }
    }

    async getOrgAnchorPeers() {
        try {
            let peer = await DbService.findPeersByOrgId(this._organization_id);
            if (!peer) {
                throw new Error('The organization is invalid, not found any peer.');
            }
            let anchorPeers = [];
            peer.map(item => {
                let flag = item.location.indexOf(common.SEPARATOR_COLON);
                let host = item.location.slice(0, flag);
                let port = item.location.slice(flag + common.SEPARATOR_COLON.length);
                anchorPeers.push({Host: host, Port: port});
            });
            return anchorPeers;
        } catch (e) {
            throw e;
        }
    }

    createChannel() {
        let channelCreateTx = {
            Consortium: this._consortium_name,
            ConsortiumId: this._consortium_id,
            Organizations: [{
                Name: stringUtil.getOrgName(this._organization_name),
                MspId: this._organization_name,
                Type: 0,
                AnchorPeers: this._anchor_peers,
            }]
        };
        return CreateChannel.createChannel(channelCreateTx, this._channel_name, this._network_config);
    }

    updateChannel(orgName) {
        return UpdateChannel.updateChannel(orgName, this._channel_name, this._network_config);
    }
};