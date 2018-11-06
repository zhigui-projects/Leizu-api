'use strict';

const Consortium = require('../../models/consortium');
const CreateChannel = require('./create-channel');
const UpdateChannel = require('./update-channel');

module.exports = class ChannelService {
    constructor(consortiumId, channelId) {
        this._consortium_id = consortiumId;
        this._network_config = null;
        this._channel_name = channelId;
    }

    async loadConfigFrmDB(consortiumId) {
        try {
            let consortium = await Consortium.findById(consortiumId);
            if (consortium) {
                if (consortium.synced) {
                    this._network_config = JSON.parse(consortium.network_config);
                } else {
                    throw new Error('The consortium does not sync.');
                }
            } else {
                throw new Error('The consortium does not exist.');
            }
        } catch (e) {
            throw e;
        }
    }

    static async getInstance(consortiumId, channelId) {
        try {
            let channelService = new ChannelService(consortiumId, channelId);
            await channelService.loadConfigFrmDB(consortiumId);
            return channelService;
        } catch (e) {
            throw e;
        }
    }

    createChannel(profile) {
        return CreateChannel.createChannel(profile, this._channel_name, this._network_config);
    }

    updateChannel(orgName) {
        return UpdateChannel.updateChannel(orgName, this._channel_name, this._network_config);
    }
};