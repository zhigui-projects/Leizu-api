'use strict';

const query = require("./query");
const FabricService = require("../db/fabric");

module.exports.syncFabric = async (consortiumId,networkConfig) => {
    let syncResults = [];
    let fabricService = new FabricService(consortiumId);
    let peerConfig = generatePeerConfig(networkConfig);
    let caConfig = generateCAConfig(networkConfig);
    let channelResult = await query.getChannels(peerConfig,caConfig);
    let channels = channelResult.channels || [];
    for(let i=0; i < channels.length; i++){
        let channel = channels[i];
        let channelDb = await fabricService.addChannel(channel);
        let channelId = channelDb._id;
        let rawResults = await query.serviceDiscovery(channel.channel_id,peerConfig,caConfig);
        let results = module.exports.processDiscoveryResults(rawResults);
        let dbResult = await fabricService.handleDiscoveryResults(channelId,results);
        syncResults.push(dbResult);
    } 
    return syncResults;
};

function generatePeerConfig(networkConfig) {
    return networkConfig.peerConfig;
}

function generateCAConfig(networkConfig) {
    return networkConfig.caConfig;
}

module.exports.processDiscoveryResults = function processDiscoveryResults(rawResults){
    let results = {
        orderers: [],
        peers: [],
        organizations: []
    };
    
    if(rawResults.msps){
        let msps = Object.keys(rawResults.msps);
        msps.forEach((key,index) =>{
            results.organizations.push(rawResults.msps[key]);
        });
    }
    
    if(rawResults.orderers){
		for (let mspid in rawResults.orderers) {
			for (let index in rawResults.orderers[mspid].endpoint) {
				results.orderers.push(rawResults.orderers[mspid].endpoint[index]);
			}
		}        
    }
    
    if(rawResults.peers_by_org){
		for (let mspid in rawResults.peers_by_org) {
			results.peers = results.peers.concat(rawResults.peers_by_org[mspid].peers);
		}
    }
    
    return results
}

