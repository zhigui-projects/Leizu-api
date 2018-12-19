/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Action = require('./action');
const ChannelService = require('../fabric/channel/channel');
const FabricService = require('../db/fabric');

module.exports = class PeerJoinAction extends Action {

    constructor() {
        super();
    }

    async execute() {
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let channelName = params.channelName;
        let organizationId = params.organization._id;
        let channelService = await ChannelService.getInstance(organizationId, channelName);
        let result = await channelService.joinChannel();
        let channel = await FabricService.findChannelAndUpdate(params.channelId, {peers: result.peers.map(peer => peer._id)});
        return channel;
    }

};