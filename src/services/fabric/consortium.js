/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const DbService = require('../db/dao');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');

module.exports.getConsortiumInfo = async (consortiumId, consortium,) => {
    let result = initConsortiumDetail(consortiumId);
    result.name = consortium.name;
    result.type = consortium.type;
    result.create_time = consortium.date;
    let channelList = await DbService.getChannelsByCondition({consortium_id: consortiumId});
    result.channel_count = channelList.length;
    if (result.channel_count > 0) {
        result.consensus_type = getConsensusType(channelList[0]);
    }
    result.org_count = await DbService.countOrgsByConsortiumId(consortiumId);
    let peerList = await DbService.findPeersByConsortiumId(consortiumId);
    result.peer_count = peerList.length;

    let allGood = true;
    for (let item of peerList) {
        let oneGood = await utils.isReachable(item.location);
        allGood = allGood & oneGood;
    }
    result.status = allGood;
    return result;
};

const initConsortiumDetail = (id) => {
    return {
        id: id,
        name: '',
        type: '',
        consensus_type: 0,
        status: 0,
        create_time: '',
        channel_count: 0,
        org_count: 0,
        peer_count: 0,
        chaincode_count: 0,
    };

};

const getConsensusType = (channel) => {
    let channelConfig = channel.configuration;
    let channelConfigObject = JSON.parse(channelConfig);
    let consensusType = channelConfigObject.groups.Orderer.values.ConsensusType.value.type;
    if (consensusType === common.CONSENSUS_SOLO) {
        return common.CONSENSUS_SOLO_VALUE;
    } else if (consensusType === common.CONSENSUS_KAFKA) {
        return common.CONSENSUS_KAFKA_VALUE;
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

