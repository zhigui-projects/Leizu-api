'use strict';

const query = require("./query");
const FabricService = require("../db/fabric");
const utils = require("../../libraries/utils");

module.exports.syncFabric = async networkConfig => {
    let fabricService = new FabricService();
    let peerConfig = generatePeerConfig(networkConfig);
    let caConfig = generateCAConfig(networkConfig);
    let channels = await query.getChannels(peerConfig,caConfig);
    await utils.asyncForEach(channels,fabricService.saveChannel);
    let results = await query.discover(networkConfig,peerConfig);
    return fabricService.handleDiscoveryResults(results);
};

function generatePeerConfig(networkConfig) {
    return {};
}

function generateCAConfig(networkConfig) {
    return {};
}

