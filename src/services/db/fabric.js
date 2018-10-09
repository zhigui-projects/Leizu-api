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
        try{
            await organization.save();
            return true;
        }catch(err){
            logger.error(err);
            return false;
        }
    }
    
    async addOrderer(dto) {
        let orderer = new Orderer();
        orderer.uuid = uuid();
        orderer.location = dto.host + dto.port;
        try{
            await orderer.save();
            return true;
        }catch(err){
            logger.error(err);
            return false;
        }
    }
    
    async addPeer(dto){
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = dto.endpoint.slice(0,dto.endpoint.indexOf(common.SEPARATOR_DOT));
        peer.location = dto.endpoint;
        try{
            await peer.save();
            return true;
        }catch(err){
            logger.error(err);
            return false;
        }
    }
    
    async handleDiscoveryResults(results) {
        if(results){
            await common.asyncForEach(results.organizations, this.addOrganization);
            await common.asyncForEach(results.orderers, this.addOrderer);
            await common.asyncForEach(results.peers, this.addPeer);
        }
        return true;
    }
}