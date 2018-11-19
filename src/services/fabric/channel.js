'use strict';

const DbService = require('../db/dao');
const CreateChannel = require('./create-channel');
const JoinChannel = require('./join-channel');
const UpdateChannel = require('./update-channel');
const common = require('../../libraries/common');

module.exports = class ChannelService {
    constructor(organizationId, channelId) {
        this._organization_id = organizationId;
        this._organization = null;
        this._channel_name = channelId;
        this._consortium_id = '';
        this._consortium_name = '';
        this._anchor_peers = [];
    }

    async init() {
        try {
            let organization = await DbService.findOrganizationById(this._organization_id);
            if (!organization) {
                throw new Error('The organization does not exist: ' + this._organization_id);
            }
            this._organization = organization;
            let consortium = await DbService.getConsortiumById(organization.consortium_id);
            if (consortium) {
                // this._network_config = JSON.parse(consortium.network_config);
                this._consortium_id = organization.consortium_id.toString();
                this._consortium_name = consortium.name;
            } else {
                throw new Error('The consortium does not exist.');
            }

            this._anchor_peers = await this.getOrgAnchorPeers();

        } catch (e) {
            throw e;
        }
    }

    static async getInstance(organizationId, channelId) {
        try {
            let channelService = new ChannelService(organizationId, channelId);
            await channelService.init();
            return channelService;
        } catch (e) {
            throw e;
        }
    }

    async getOrgAnchorPeers() {
        try {
            let peer = await DbService.findPeersByOrgId(this._organization_id);
            let anchorPeers = [];
            if (peer) {
                peer.map(item => {
                    let flag = item.location.indexOf(common.SEPARATOR_COLON);
                    let host = item.location.slice(0, flag);
                    let port = item.location.slice(flag + common.SEPARATOR_COLON.length);
                    anchorPeers.push({Host: host, Port: port});
                });
            }
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
                Name: this._organization.name,
                MspId: this._organization.msp_id,
                Type: 0,
                AnchorPeers: this._anchor_peers,
            }]
        };
        return CreateChannel.createChannel(channelCreateTx, this._channel_name, this._organization);
    }

    joinChannel() {
        return JoinChannel.joinChannel(this._channel_name, this._organization);
    }

    updateChannel(orgName) {
        return UpdateChannel.updateChannel(orgName, this._channel_name, this._network_config);
    }

    updateSysChannel() {
        return UpdateChannel.updateSysChannel({
            ConsortiumId: this._consortium_id,
            Organizations: [{
                Name: this._organization.name,
                MspId: this._organization.msp_id,
                Type: 0
            }]
        });
    }
};