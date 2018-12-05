/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const query = require('./query');
const FabricService = require('../db/fabric');

module.exports.syncFabric = async (consortiumId, networkConfig) => {
    let syncResults = [];
    let fabricService = new FabricService(consortiumId);
    let discoverConfig = generateDiscoverConfig(networkConfig);
    if (!discoverConfig) {
        throw new Error('Invalid consortium config');
    }
    let peerConfig = discoverConfig.peer;
    let caConfig = discoverConfig.ca;
    // TODO Discovery system channel
    let channelResult = await query.getChannels(peerConfig, caConfig);
    let channels = channelResult.channels || [];
    for (let i = 0; i < channels.length; i++) {
        let channelInfo = channels[i];
        let channelConfig = await query.getChannelConfig(channelInfo.channel_id, peerConfig, caConfig);
        channelInfo.channelConfig = channelConfig || {};
        let rawResults = await query.serviceDiscovery(channelInfo.channel_id, peerConfig, caConfig);
        let results = module.exports.processDiscoveryResults(rawResults);
        let dbResult = await fabricService.handleDiscoveryResults(networkConfig, channelInfo, results);
        syncResults.push(dbResult);
    }
    return syncResults;
};

const generateDiscoverConfig = (networkConfig) => {
    for (let item of networkConfig.orgs) {
        for (let peer of item.peers) {
            if (peer['server-hostname'] !== networkConfig.discoverPeer) {
                continue;
            }
            peer.mspid = item.mspId;
            peer.adminKey = item.signIdentity.adminKey;
            peer.adminCert = item.signIdentity.adminCert;
            return {
                ca: item.ca,
                peer: peer
            };
        }
    }
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
            for (let peer of rawResults.peers_by_org[mspid].peers) {
                peer.mspid = mspid;
                results.peers.push(peer);
            }
        }
    }

    return results;
};

