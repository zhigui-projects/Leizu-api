"use strict";

const UpdateChannel = require("./update-channel");

module.exports = class ChannelService {
    
    constructor(){
        
    }
    
    static getInstance(){
        let channelService = new ChannelService();
        return channelService;
    }
    
    async createChannel(params){
        
    }
    
    async updateChannel(id,params){
        let isSupported = false;
        if(isSupported){
            await UpdateChannel.updateChannel(params,{});
        }
    }
    
}