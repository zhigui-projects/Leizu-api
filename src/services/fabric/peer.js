'use strict';

const {HFCAIdentityType} = require('fabric-ca-client/lib/IdentityService');
const ChannelService = require('./join-channel');
const CredentialHelper = require('./credential-helper');
const CryptoCaService = require('./crypto-ca');
const DbService = require('../db/dao');
const PromClient = require('../prometheus/client');
const SSHClient = require('../ssh/client');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const config = require('../../env');

module.exports = class PeerService {

    static async findById(id) {
        return await DbService.findPeerById(id);
    }

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

    static async joinChannel(channelName, params) {
        return await ChannelService.joinChannel(channelName, params);
    }

    static async create(params) {
        const {organizationId, image, username, password, host, port} = params;
        const org = await DbService.findOrganizationById(organizationId);
        const peerName = `peer-${host.replace(/\./g, '-')}`;
        let peerPort = common.PORT.PEER;
        if (utils.isSingleMachineTest()) {
            peerPort = utils.generateRandomHttpPort();
        }

        let containerOptions = {
            image: image || config.network.peer.availableImages[0],
            workingDir: `${common.PEER_HOME}/${org.consortium_id}/${org.name}/peers/${peerName}`,
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

        const peerDto = await this.preContainerStart({org, peerName, connectionOptions});

        const client = SSHClient.getInstance(connectionOptions);
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

    static async preContainerStart({org, peerName, connectionOptions}) {
        await this.createContainerNetwork(connectionOptions);

        const peerDto = await this.prepareCerts(org, peerName);
        const certFile = `${peerDto.credentialsPath}.zip`;
        const remoteFile = `${common.PEER_HOME}/${org.consortium_id}/${org.name}/peers/${peerName}.zip`;
        const remotePath = `${common.PEER_HOME}/${org.consortium_id}/${org.name}/peers/${peerName}`;
        await SSHClient.getInstance(connectionOptions).transferFile({
            local: certFile,
            remote: remoteFile
        });
        const bash = SSHClient.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));
        await bash.exec(['-c', `unzip -o ${remoteFile} -d ${remotePath}`]);
        return peerDto;
    }

    static async createContainerNetwork(connectionOptions) {
        const parameters = utils.generateContainerNetworkOptions({name: common.DEFAULT_NETWORK.NAME});
        await SSHClient.getInstance(connectionOptions).createContainerNetwork(parameters);
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
};
