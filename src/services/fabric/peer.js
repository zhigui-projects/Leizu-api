"use strict";

const ChannelService = require("./join-channel");

module.exports = class PeerService {
    
    constructor(){
        
    }
    
    static getInstance(){
        let peerService = new PeerService();
        return peerService;
    }
    
    async joinChannel(channelName,params){
        let isSupported = false;
        if(isSupported){
            ChannelService.joinChannel(channelName,params);
        }
    }
    
}