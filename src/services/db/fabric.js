'use strict';

const uuid = require("uuid/v1");
const logger = require("../../libraries/log4js");
const common = require("../../libraries/common");
const Channel = require("../../models/channel");
const Organization = require("../../models/organization");
const Orderer = require("../../models/orderer");
const Peer = require("../../models/peer");

module.exports = class FabricService {
    
    constructor(consortiumId) {
        this.isFabric = true;
        this.consortiumId = consortiumId;
    }
    
    async findChannel(filter){
        let condition = filter || {};
        try{
            let channel = await Channel.findOne(condition);
            return channel;
        }catch(err){
            logger.error(err);
            return null;
        }        
    }
    
    async addChannel(dto) {
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = dto.name;
        channel.consortium_id = this.consortiumId;
        try{
            channel = await channel.save();
            return channel;
        }catch(err){
            logger.error(err);
            return null;
        }
    }

    async addOrganization(dto) {
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.id;
        organization.consortium_id = this.consortiumId;
        try{
            organization = await organization.save();
            return organization;
        }catch(err){
            logger.error(err);
            return null;
        }
    }
    
    async addOrderer(dto) {
        let orderer = new Orderer();
        orderer.uuid = uuid();
        orderer.location = dto.host + dto.port;
        try{
            orderer = await orderer.save();
            return orderer;
        }catch(err){
            logger.error(err);
            return null;
        }
    }
    
    async addPeer(dto){
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = dto.endpoint.slice(0,dto.endpoint.indexOf(common.SEPARATOR_DOT));
        peer.location = dto.endpoint;
        try{
            peer = await peer.save();
            return peer;
        }catch(err){
            logger.error(err);
            return null;
        }
    }
    
    async handleDiscoveryResults(channelId, results) {
        this.channelId = channelId;
        let result = {
            organizations: [],
            orderers: [],
            peers: [],
        };
        if(results){
            for(let index=0; index < results.organizations.length; index++){
                let organization = await this.addOrganization(results.organizations[index])
                result.organizations.push(organization);
            }
            for(let index=0; index < results.orderers.length; index++){
                let orderer = await this.addOrderer(results.orderers[index])
                result.orderers.push(orderer);
            }
            for(let index=0; index < results.peers.length; index++){
                let peer = await this.addPeer(results.peers[index])
                result.peers.push(peer);
            }            
        }
        return result;
    }
}
