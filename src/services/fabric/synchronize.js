'use strict';

const query = require('./query');
const FabricService = require('../db/fabric');

module.exports.syncFabric = async (consortiumId, networkConfig) => {
    let syncResults = [];
    let fabricService = new FabricService(consortiumId);
    let peerConfig = generatePeerConfig(networkConfig);
    let caConfig = generateCAConfig(networkConfig);
    let channelResult = await query.getChannels(peerConfig, caConfig);
    let channels = channelResult.channels || [];
    for (let i = 0; i < channels.length; i++) {
        let channelInfo = channels[i];
        let channelConfig = await query.getChannelConfig(channelInfo.channel_id, peerConfig, caConfig);
        channelInfo.channelConfig = channelConfig || {};
        let rawResults = await query.serviceDiscovery(channelInfo.channel_id, peerConfig, caConfig);
        let results = module.exports.processDiscoveryResults(rawResults);
        let dbResult = await fabricService.handleDiscoveryResults(channelInfo, results);
        syncResults.push(dbResult);
    }
    return syncResults;
};

const generatePeerConfig = (networkConfig) => {
    return networkConfig.peerConfig;
};

const generateCAConfig = (networkConfig) => {
    return networkConfig.caConfig;
};

module.exports.processDiscoveryResults = (rawResults) => {
    let results = {
        orderers: [],
        peers: [],
        organizations: []
    };

    if (rawResults.msps) {
        let msps = Object.keys(rawResults.msps);
        msps.forEach((key) => {
            results.organizations.push(rawResults.msps[key]);
        });
    }

    if (rawResults.orderers) {
        for (let mspid in rawResults.orderers) {
            for (let index in rawResults.orderers[mspid].endpoints) {
                let orderer = rawResults.orderers[mspid].endpoints[index];
                orderer.mspid = mspid;
                results.orderers.push(orderer);
            }
        }
    }

    if (rawResults.peers_by_org) {
        for (let mspid in rawResults.peers_by_org) {
            for(let peer of rawResults.peers_by_org[mspid].peers){
                peer.mspid = mspid;
                results.peers.push(peer);
            }
        }
    }

    return results;
};

