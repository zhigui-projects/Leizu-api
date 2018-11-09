"use strict";

const ChannelService = require('./join-channel');
const CredentialHelper = require('./credential-helper');
const DbService = require('../db/dao');
const PromClient = require('../prometheus/client');
const DockerClient = require('../docker/client');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const config = require('../../env');

module.exports = class PeerService {

    static async findById(id) {
        return await DbService.findPeerById(id);
    }

    static async list(orgId) {
        const {peers, channels, organizations} = await this.queryDetails(orgId);
        const promClient = new PromClient();
        const cpuMetrics = await promClient.queryCpuUsage();
        const memoryMetrics = await promClient.queryMemoryUsage();

        return peers.map((peer) => {
            let org = organizations;
            if (!orgId) {
                org = organizations.find(org => org._id.equals(peer.org_id));
            }
            let organizationName = (org && org.name) || null;
            let channelNames = channels.filter(channel => channel.peers.some(id => peer._id.equals(id)))
                .map(channel => channel.name);
            let cpuMetric = cpuMetrics.find(data => peer.location.includes(data.metric.name));
            let cpu = 0;
            if (cpuMetric) {
                cpu = cpuMetric.value[1];
            }
            let memoryMetric = memoryMetrics.find(data => peer.location.includes(data.metric.name));
            let memory = 0;
            if (memoryMetric) {
                memory = memoryMetric.value[1];
            }
            //TODO: need to detect docker container status
            let status = 'running';
            return {...peer.toJSON(), organizationName, channelNames, status, cpu, memory};
        });
    }

    static async queryDetails(orgId) {
        let peers, channels, organizations = [];
        if (orgId) {
            peers = await DbService.findPeersByOrgId(orgId);
            organizations = await DbService.findOrganizationById(orgId);
        } else {
            peers = await DbService.findPeers();
            organizations = await DbService.findOrganizations();

        }
        channels = await DbService.getChannels();
        return {peers, channels, organizations};
    };

    static async joinChannel(channelName, params) {
        ChannelService.joinChannel(channelName, params);
    }

    static async create(params) {
        const {organizationId, username, password, host, port} = params;

        const org = await DbService.findOrganizationById(organizationId);
        const peerName = `${org.name}-${host.replace(/\./g, '-')}`;
        let containerOptions = {
            workingDir: common.PEER_HOME,
            peerName: peerName,
            mspid: org.msp_id,
            port: common.PORT_PEER
        };

        let connectionOptions, parameters = null;
        if (config.docker.enabled) {
            connectionOptions = {
                mode: common.MODES.DOCKER,
                protocol: common.PROTOCOL_HTTP,
                host: host,
                port: port || config.docker.port
            };
            parameters = utils.generatePeerContainerOptions(containerOptions);
        } else {
            connectionOptions = {
                mode: common.MODES.SSH,
                host: host,
                username: username,
                password: password,
                port: port || config.ssh.port
            };
            parameters = utils.generatePeerContainerCreateOptions(containerOptions);
        }

        await this.preContainerStart({org, connectionOptions});

        const client = DockerClient.getInstance(connectionOptions);
        const container = await client.createContainer(parameters);
        await utils.wait(`tcp:${host}:${common.PORT_PEER}`);
        if (container) {
            return await DbService.addPeer({
                name: peerName,
                organizationId: organizationId,
                location: `${host}:${common.PORT_PEER}`
            });
        } else {
            throw new Error('create peer failed');
        }
    }

    static async preContainerStart(params) {
        const {org, connectionOptions} = params;
        const certs = {
            adminKey: org.admin_key,
            adminCert: org.admin_cert,
            rootCert: org.root_cert
        };
        const certPath = await CredentialHelper.storeCredentials(org.msp_id, certs);
        const remotePath = `${common.PEER_HOME}/${org.msp_id}.zip`;
        await DockerClient.getInstance(connectionOptions).transferFile({
            local: certPath,
            remote: remotePath
        });
        const bash = DockerClient.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));

        await bash.exec(['-c', `unzip -o ${remotePath} -d ${common.PEER_HOME}/data/msp`]);
        await bash.exec(['-c', `mkdir -p ${common.PEER_HOME}/data/tls`]);
        await bash.exec(['-c', `cp ${common.PEER_HOME}/data/msp/signcerts/* ${common.PEER_HOME}/data/tls/server.crt`]);
        await bash.exec(['-c', `cp ${common.PEER_HOME}/data/msp/keystore/* ${common.PEER_HOME}/data/tls/server.key`]);
        await bash.exec(['-c', `cp ${common.PEER_HOME}/data/msp/cacerts/* ${common.PEER_HOME}/data/tls/ca.pem`]);
    }
};
