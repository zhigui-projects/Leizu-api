'use strict';

const DbService = require('../db/dao');
const common = require('../../libraries/common');
const PromClient = require('../../services/prometheus/client');

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
    result.peer_count = await DbService.countPeersByConsortiumId(consortiumId);
    result.status = await getNetworkStatus();
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

const getNetworkStatus = async () => {
    const promClient = new PromClient();
    const memoryMetrics = await promClient.queryMemoryUsage();
    if (memoryMetrics && memoryMetrics.length > 0) {
        for (let idx in memoryMetrics) {
            let data = memoryMetrics[idx];
            if (data.metric.container_label_com_docker_compose_container_number > 0) {
                return 1;
            }
        }
    }
    return 0;
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

