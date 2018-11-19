'use strict';

const ChannelService = require('./join-channel');
const CredentialHelper = require('./credential-helper');
const CryptoCaService = require('./crypto-ca');
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
        return await ChannelService.joinChannel(channelName, params);
    }

    static async create(params) {
        const {organizationId, username, password, host, port} = params;
        const org = await DbService.findOrganizationById(organizationId);
        const peerName = `peer-${host.replace(/\./g, '-')}`;
        let peerPort = common.PORT_PEER;
        if (utils.isSingleMachineTest()){
            peerPort = utils.generateRandomHttpPort();
        }

        let containerOptions = {
            workingDir: `${common.PEER_HOME}/${org.consortium_id}/${org.name}`,
            peerName: peerName,
            domainName: org.domain_name,
            mspid: org.msp_id,
            port:  peerPort
        };

        let connectionOptions = null;
        if (config.docker.enabled) {
            connectionOptions = {
                mode: common.MODES.DOCKER,
                protocol: common.PROTOCOL.HTTP,
                host: host,
                port: port || config.docker.port
            };
        } else {
            connectionOptions = {
                mode: common.MODES.SSH,
                host: host,
                username: username,
                password: password,
                port: port || config.ssh.port
            };
        }

        const peerDto = await this.preContainerStart({org, peerName, connectionOptions});

        const client = DockerClient.getInstance(connectionOptions);
        const parameters = utils.generatePeerContainerOptions(containerOptions, connectionOptions.mode);
        const container = await client.createContainer(parameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${peerPort}`);
        if (container) {
            return await DbService.addPeer(Object.assign({}, peerDto, {
                name: peerName,
                organizationId: organizationId,
                location: `${host}:${peerPort}`
            }));
        } else {
            throw new Error('create peer failed');
        }
    }

    static async preContainerStart({org, peerName, connectionOptions}) {
        await this.createContainerNetwork(connectionOptions);

        const peerDto = await this.prepareCerts(org, peerName);

        const certFile = `${peerDto.credentialsPath}.zip`;
        const remoteFile = `${common.PEER_HOME}/${org.consortium_id}/${org.name}.zip`;
        const remotePath = `${common.PEER_HOME}/${org.consortium_id}/${org.name}`;
        await DockerClient.getInstance(connectionOptions).transferFile({
            local: certFile,
            remote: remoteFile
        });
        const bash = DockerClient.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));
        await bash.exec(['-c', `mkdir -p ${remotePath}/msp ${remotePath}/tls`]);
        await bash.exec(['-c', `unzip -o ${remoteFile} -d ${remotePath}/msp`]);
        await bash.exec(['-c', `cp ${remotePath}/msp/tls/cert.pem ${remotePath}/tls/server.crt`]);
        await bash.exec(['-c', `cp ${remotePath}/msp/tls/key.pem ${remotePath}/tls/server.key`]);
        await bash.exec(['-c', `cp ${remotePath}/msp/cacerts/ca-cert.pem ${remotePath}/tls/ca.pem`]);

        const configTxPath = `${config.configtxlator.dataPath}/${org.consortium_id}/${org.name}`;
        await DockerClient.getInstance(config.configtxlator.connectionOptions).transferDirectory({
            localDir: org.msp_path,
            remoteDir: configTxPath
        });
        return peerDto;
    }

    static async createContainerNetwork(connectionOptions) {
        const parameters = utils.generateContainerNetworkOptions({name: common.DEFAULT_NETWORK.NAME});
        await DockerClient.getInstance(connectionOptions).createContainerNetwork(parameters);
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
        await caService.registerPeerAdminUser();
        const mspInfo = await caService.enrollUser(peerAdminUser);
        const tlsInfo = await caService.enrollUser(Object.assign({}, peerAdminUser, {profile: 'tls'}));
        const peerDto = {
            orgName: org.name,
            consortiumId: org.consortium_id.toString(),
            tls: {}
        };
        peerDto.signkey = mspInfo.key.toBytes();
        peerDto.signCert = mspInfo.certificate;
        peerDto.adminCert = org.admin_cert;
        peerDto.rootCert = org.root_cert;
        peerDto.tls.key = tlsInfo.key.toBytes();
        peerDto.tls.cert = tlsInfo.certificate;
        peerDto.credentialsPath = await CredentialHelper.storeCredentials(peerDto);
        return peerDto;
    }
};
