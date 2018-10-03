'use strict';

const uuid = require("uuid/v1");
const logger = require("../../libraries/log4js");
const Channel = require("../../models/channel");

module.exports = class FabricService {
    
    constructor() {
        this.isFabric = true;
    }
    
    async saveChannel(channelInfo) {
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = channelInfo.name;
        try{
            channel.save();
            return true;
        }catch(err){
            logger.error(err);
            return false;
        }
    }
    
    async handleDiscoveryResults(results){
        return;
    }
}