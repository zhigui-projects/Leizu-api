'use strict';

const Action = require('./action');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const DaoService = require('../db/dao');
const ChannelService = require('../fabric/channel');
const FabricService = require('../db/fabric');

module.exports = class PeerJoinAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let channelName = params.channelName;
        let organizationId = params.organization._id;
        let channelService = await ChannelService.getInstance(organizationId, channelName);
        let result = await channelService.joinChannel();
        let channel = await FabricService.findChannelAndUpdate(channelId, result);
        return channel;
    }

};