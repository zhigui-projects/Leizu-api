/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Action = require('./action');
const ChannelService = require('../fabric/channel');
const FabricService = require('../db/fabric');


module.exports = class ChannelCreateAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let parameters = this.context.get(this.registry.CONTEXT.PARAMS);
        let organizationId = parameters.organizationIds[0];
        let channelName = parameters.name;
        let channelService = await ChannelService.getInstance(organizationId, channelName);
        let configEnvelope = await channelService.createChannel(parameters.organizationIds);
        let fabricService = new FabricService(channelService._consortium_id);
        let channel = await fabricService.addChannel({
            name: parameters.name,
            configuration: configEnvelope
        });
        return channel;
    }

};