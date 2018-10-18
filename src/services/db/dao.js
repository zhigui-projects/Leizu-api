"use strict"

const uuid = require('uuid/v1');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Orderer = require('../../models/orderer');
const Peer = require('../../models/peer');

module.exports = class DbService {
    
    static async getChannels(){
        let channels =  await Channel.find();
        return channels;
    }
    
    static async getChannelById(id){
        let channel = await Channel.findById(id);
        return channel;
    }
    
    static async addChannel(dto){
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = dto.name;
        channel.consortium_id = dto.consortiumId;
        channel = await channel.save();
        return channel;
    }
    
}