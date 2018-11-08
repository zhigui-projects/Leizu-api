"use strict";

const ChannelService = require("./join-channel");

module.exports = class PeerService {

    constructor() {

    }

    static getInstance() {
        let peerService = new PeerService();
        return peerService;
    }

    async joinChannel(channelName, params) {
        ChannelService.joinChannel(channelName, params);
    }
};
