'use strict';

const utils = require('../../libraries/utils');
const stringUtil = require('../../libraries/string-util');
const common = require('../../libraries/common');

module.exports = class RequestHelper {

    static decomposeRequest(ctx) {
        let configuration = utils.extend({}, ctx.request.body);
        configuration.orderer = RequestHelper.getOrderer(configuration);
        configuration.peers = RequestHelper.getPeers(configuration);
        configuration.isKafkaConsensus = RequestHelper.isKafkaConsensus(configuration);
        if (configuration.isKafkaConsensus) {
            configuration.kafkaCluster = RequestHelper.getKafkaCluster(configuration);
        }
        return configuration;
    }

    static getOrderer(configuration) {
        let orderer = {};
        if (configuration.ordererOrg) {
            let ordererOrg = configuration.ordererOrg;
            orderer.orgName = ordererOrg.name;
            orderer.caName = ordererOrg.ca.name;
            orderer.caUrl = stringUtil.getUrl(common.PROTOCOL.HTTP, ordererOrg.ca.ip, common.PORT.CA);
            orderer.caNode = {
                host: ordererOrg.ca.ip,
                username: ordererOrg.ca.ssh_username,
                password: ordererOrg.ca.ssh_password
            };
            orderer.nodes = [];
            if (ordererOrg.orderer) {
                for (let item of ordererOrg.orderer) {
                    orderer.nodes.push({
                        name: item.name,
                        host: item.ip,
                        username: item.ssh_username,
                        password: item.ssh_password
                    });
                }
            }
        }
        return orderer;
    }

    static getPeers(configuration) {
        let peers = [];
        if (configuration.peerOrgs) {
            for (let item of configuration.peerOrgs) {
                let peer = {};
                peer.orgName = item.name;
                peer.caName = item.ca.name;
                peer.caUrl = stringUtil.getUrl(common.PROTOCOL.HTTP, item.ca.ip, common.PORT.CA);
                peer.caNode = {
                    host: item.ca.ip,
                    username: item.ca.ssh_username,
                    password: item.ca.ssh_password
                };
                peer.nodes = [];
                for (let element of item.peers) {
                    peer.nodes.push({
                        orgName: item.name,
                        name: element.name,
                        host: element.ip,
                        username: element.ssh_username,
                        password: element.ssh_password
                    });
                }
                peers.push(peer);
            }
        }
        return peers;
    }

    static getKafkaCluster(configuration) {
        let cluster = {};
        let zks = [];
        for (let zk of configuration.zookeeper) {
            zks.push({
                name: zk.name,
                host: zk.ip,
                username: zk.ssh_username,
                password: zk.ssh_password
            });
        }
        let kfs = [];
        for (let kf of configuration.kafka) {
            kfs.push({
                name: kf.name,
                host: kf.ip,
                username: kf.ssh_username,
                password: kf.ssh_password
            });
        }
        cluster.zookeepers = zks;
        cluster.kafkas = kfs;
        return cluster;
    }

    static isKafkaConsensus(configuration) {
        if (configuration.consensus == common.CONSENSUS_KAFKA) {
            return true;
        } else {
            return false;
        }
    }
};