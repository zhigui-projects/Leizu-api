'use strict';

const query = require("./query");
const FabricService = require("../db/fabric");
const utils = require("../../libraries/utils");

module.exports.syncFabric = async networkConfig => {
    let fabricService = new FabricService();
    let peerConfig = generatePeerConfig(networkConfig);
    let caConfig = generateCAConfig(networkConfig);
    let channels = await query.getChannels(peerConfig,caConfig);
    await utils.asyncForEach(channels,fabricService.addChannel);
    let rawResults = await query.discover(networkConfig,peerConfig);
    let results = processDiscoveryResults(rawResults);
    return fabricService.handleDiscoveryResults(results);
};

function generatePeerConfig(networkConfig) {
    return {};
}

function generateCAConfig(networkConfig) {
    return {};
}

function processDiscoveryResults(rawResults){
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

