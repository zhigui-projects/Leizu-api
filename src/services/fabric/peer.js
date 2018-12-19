/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const {HFCAIdentityType} = require('fabric-ca-client/lib/IdentityService');
const ChannelService = require('./channel/channel');
const CredentialHelper = require('./tools/credential-helper');
const CryptoCaService = require('./tools/crypto-ca');
const DbService = require('../db/dao');
const FabricService = require('../db/fabric');
const PromClient = require('../prometheus/client');
const Client = require('../transport/client');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const config = require('../../env');

module.exports = class PeerService {

    static async findByIdAndConsortiumId(id, consortiumId) {
        return await DbService.findPeerByFilter({_id: id, consortium_id: consortiumId});
    }

    static async list(orgId, consortiumId) {
        const {peers, channels, organizations} = await this.queryDetails(orgId, consortiumId);
        const promClient = new PromClient();
        const cpuMetrics = await promClient.queryCpuUsage();
        const memoryMetrics = await promClient.queryMemoryUsage();

        return peers.map((peer) => {
            let org = organizations;
            if (!orgId) {
                org = organizations.find(org => org._id.equals(peer.org_id));
            }
            let organizationName = (org && org.name) || null;
            let channelNames = channels.filter(channel => channel.peers.some(id => peer._id.equals(id))).map(channel => channel.name);
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
            peer.name = utils.replacePeerName(peer.name);
            return {...peer.toJSON(), organizationName, channelNames, status, cpu, memory};
        });
    }

    static async queryDetails(orgId, consortiumId) {
        let peers, channels, organizations = [];
        if (orgId) {
            peers = await DbService.findPeersByOrgId(orgId);
            organizations = await DbService.findOrganizationById(orgId);
        } else {
            peers = await DbService.findPeersByConsortiumId(consortiumId);
            organizations = await DbService.getOrganizationsByFilter({consortium_id: consortiumId});

        }
        channels = await DbService.getChannels();
        return {peers, channels, organizations};
    }

    static async checkStatus(params) {
        const {host, username, password, port} = params;
        let connectionOptions = {
            host: host,
            username: username,
            password: password,
            port: port || config.ssh.port,
            cmd: 'bash'
        };
        const bash = Client.getInstance(connectionOptions);
        await bash.exec(['-c', 'date']);
    }

    static async create(params) {
        const {organizationId, image, username, password, host, port} = params;
        const org = await DbService.findOrganizationById(organizationId);
        if (!org) {
            throw new Error('The organization does not exist: ' + organizationId);
        }
        if (org.type !== common.PEER_TYPE_PEER) {
            throw new Error('The organization type can not orderer');
        }
        let peerNamePrefix = 'peer';
        if (params.peerName) {
            peerNamePrefix = params.peerName;
        }
        const peerName = `${peerNamePrefix}-${host.replace(/\./g, '-')}`;
        let peerPort = common.PORT.PEER;
        let peerHome = common.PEER_HOME;
        if (process.env.RUN_MODE === common.RUN_MODE.LOCAL) {
            peerHome = '/tmp' + peerHome;
        }
        if (utils.isSingleMachineTest()) {
            peerPort = utils.generateRandomHttpPort();
        }

        let containerOptions = {
            image: image || config.network.peer.availableImages[0],
            workingDir: `${peerHome}/${org.consortium_id}/${org.name}/peers/${peerName}`,
            peerName,
            domainName: org.domain_name,
            mspId: org.msp_id,
            port: peerPort,
            enableTls: config.network.peer.tls,
        };

        let connectionOptions = {
            host: host,
            username: username,
            password: password,
            port: port || config.ssh.port
        };

        const peerDto = await this.preContainerStart({org, peerName, peerHome, connectionOptions});

        const client = Client.getInstance(connectionOptions);
        const parameters = utils.generatePeerContainerOptions(containerOptions);
        const container = await client.createContainer(parameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${peerPort}`);
        if (container) {
            return await DbService.addPeer(Object.assign({}, peerDto, {
                name: peerName,
                organizationId: organizationId,
                location: `${host}:${peerPort}`,
                consortiumId: org.consortium_id,
            }));
        } else {
            throw new Error('create peer failed');
        }
    }

    static async preContainerStart({org, peerName, peerHome, connectionOptions}) {
        await this.createContainerNetwork(connectionOptions);

        const peerDto = await this.prepareCerts(org, peerName);
        const certFile = `${peerDto.credentialsPath}.zip`;
        const remoteFile = `${peerHome}/${org.consortium_id}/${org.name}/peers/${peerName}.zip`;
        const remotePath = `${peerHome}/${org.consortium_id}/${org.name}/peers/${peerName}`;
        await Client.getInstance(connectionOptions).transferFile({
            local: certFile,
            remote: remoteFile
        });
        const bash = Client.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));
        await bash.exec(['-c', `unzip -o ${remoteFile} -d ${remotePath}`]);
        return peerDto;
    }

    static async createContainerNetwork(connectionOptions) {
        const parameters = utils.generateContainerNetworkOptions({name: common.DEFAULT_NETWORK.NAME});
        await Client.getInstance(connectionOptions).createContainerNetwork(parameters);
    }

    static async prepareCerts(org, peerName) {
        const ca = await DbService.findCertAuthorityByOrg(org._id);
        const peerAdminUser = {
            enrollmentID: `${peerName}.${org.domain_name}`,
            enrollmentSecret: `${peerName}pw`,
        };
        const options = {
            caName: ca.name,
            orgName: org.name,
            url: ca.url,
            adminUser: peerAdminUser
        };
        const caService = new CryptoCaService(options);
        await caService.bootstrapUserEnrollement();
        await caService.registerAdminUser(HFCAIdentityType.PEER);
        const mspInfo = await caService.enrollUser(peerAdminUser);
        const tlsInfo = await caService.enrollUser(Object.assign({}, peerAdminUser, {profile: 'tls'}));
        const peerDto = {
            orgName: org.name,
            name: peerName,
            consortiumId: org.consortium_id.toString(),
            tls: {}
        };
        peerDto.adminKey = mspInfo.key.toBytes();
        peerDto.adminCert = org.admin_cert;
        peerDto.signcerts = mspInfo.certificate;
        peerDto.rootCert = org.root_cert;
        peerDto.tlsRootCert = org.root_cert;
        peerDto.tls.cacert = org.root_cert;
        peerDto.tls.key = tlsInfo.key.toBytes();
        peerDto.tls.cert = tlsInfo.certificate;
        peerDto.credentialsPath = await CredentialHelper.storePeerCredentials(peerDto);
        return peerDto;
    }

    static async checkChannel(organizationId, peers, channelId) {
        try {
            if (!channelId) return;
            const org = await DbService.findOrganizationById(organizationId);
            if (!org) {
                throw new Error('The organization does not exist: ' + organizationId);
            }
            if (org.type !== common.PEER_TYPE_PEER) {
                throw new Error('The organization type can not orderer');
            }
            const channel = await DbService.getChannelById(channelId);
            if (!channel) {
                throw new Error('The channel does not exist: ' + channelId);
            }
            if (channel.orgs.indexOf(organizationId) !== -1) {
                return;
            }
            let channelService = await ChannelService.getInstance(organizationId, channel.name);
            await channelService.updateAppChannel(channelId);
            await channelService.joinChannel(peers);
            await FabricService.findChannelAndUpdate(channelId, {orgs: [organizationId], peers: peers});
        } catch (err) {
            throw err;
        }
    }

};
