'use strict';
const fs = require('fs');
const path = require('path');
const {HFCAIdentityType} = require('fabric-ca-client/lib/IdentityService');
const utils = require('../../libraries/utils');
const config = require('../../env');
const common = require('../../libraries/common');
const CredentialHelper = require('./credential-helper');
const CryptoCaService = require('./crypto-ca');
const DbService = require('../db/dao');
const DockerClient = require('../docker/client');
const ConfigTxlator = require('./configtxlator');
const CreateConfigTx = require('./configtxgen');

module.exports = class OrdererService {

    static async get() {
        return await DbService.findOrderes();
    }

    static async findById(id) {
        return await DbService.findOrdererById(id);
    }

    static async create(params) {
        const {organizationId, image, username, password, host, port, options} = params;

        const org = await DbService.findOrganizationById(organizationId);
        const consortium = await DbService.getConsortiumById(org.consortium_id);
        const ordererName = `orderer-${host.replace(/\./g, '-')}`;
        const ordererPort = common.PORT.ORDERER;

        let containerOptions = {
            image,
            workingDir: `${common.ORDERER_HOME}/${consortium._id}/${org.name}/peers/${ordererName}`,
            ordererName,
            domainName: org.domain_name,
            mspId: org.msp_id,
            port: ordererPort,
            enableTls: config.network.orderer.tls,
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

        const ordererDto = await this.preContainerStart({org, consortium, ordererName, ordererPort, connectionOptions, options});

        const client = DockerClient.getInstance(connectionOptions);
        const parameters = utils.generateOrdererContainerOptions(containerOptions, connectionOptions.mode);
        const container = await client.createContainer(parameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${ordererPort}`);
        if (container) {
            return await DbService.addOrderer(Object.assign({}, ordererDto, {
                name: ordererName,
                organizationId: organizationId,
                location: `${host}:${ordererPort}`,
                consortiumId: consortium._id,
            }));
        } else {
            throw new Error('create orderer failed');
        }
    }

    static async preContainerStart({org, consortium, ordererName, ordererPort, connectionOptions, options}) {
        await this.createContainerNetwork(connectionOptions);
        let ordererDto = await this.prepareCerts(org, consortium, ordererName);
        const genesisBlockFile = await this.prepareGenesisBlock({org, consortium, ordererName, ordererPort, configtx: options});

        const certFile = `${ordererDto.credentialsPath}.zip`;
        const remoteFile = `${common.ORDERER_HOME}/${consortium._id}/${org.name}/peers/${ordererName}.zip`;
        const remotePath = `${common.ORDERER_HOME}/${consortium._id}/${org.name}/peers/${ordererName}`;
        const client = DockerClient.getInstance(connectionOptions);
        await client.transferFile({local: certFile, remote: remoteFile});
        await client.transferFile({local: genesisBlockFile, remote: `${remotePath}/genesis.block`});


        const bash = DockerClient.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));
        await bash.exec(['-c', `unzip -o ${remoteFile} -d ${remotePath}`]);
        return ordererDto;
    }

    static async createContainerNetwork(connectionOptions) {
        const parameters = utils.generateContainerNetworkOptions({name: common.DEFAULT_NETWORK.NAME});
        await DockerClient.getInstance(connectionOptions).createContainerNetwork(parameters);
    }

    static async prepareCerts(org, consortium, ordererName) {
        const ca = await DbService.findCertAuthorityByOrg(org._id);
        const ordererAdminUser = {
            enrollmentID: `${ordererName}.${org.domain_name}`,
            enrollmentSecret: `${ordererName}pw`,
        };
        const options = {
            caName: ca.name,
            orgName: org.name,
            url: ca.url,
            adminUser: ordererAdminUser
        };
        const caService = new CryptoCaService(options);
        await caService.bootstrapUserEnrollement();
        await caService.registerAdminUser(HFCAIdentityType.ORDERER);
        const mspInfo = await caService.enrollUser(ordererAdminUser);
        const tlsInfo = await caService.enrollUser(Object.assign({}, ordererAdminUser, {profile: 'tls'}));
        const ordererDto = {
            orgName: org.name,
            name: ordererName,
            consortiumId: String(consortium._id),
            tls: {}
        };
        ordererDto.adminKey = mspInfo.key.toBytes();
        ordererDto.adminCert = org.admin_cert;
        ordererDto.signcerts = mspInfo.certificate;
        ordererDto.rootCert = org.root_cert;
        ordererDto.tlsRootCert = org.root_cert;
        ordererDto.tls.cacert = org.root_cert;
        ordererDto.tls.key = tlsInfo.key.toBytes();
        ordererDto.tls.cert = tlsInfo.certificate;
        ordererDto.credentialsPath = await CredentialHelper.storePeerCredentials(ordererDto);
        return ordererDto;
    }

    static async prepareGenesisBlock({org, consortium, ordererName, ordererPort, configtx}) {
        let options = {
            ConsortiumId: String(consortium._id),
            Consortium: consortium.name,
            Orderer: {
                OrdererType: configtx.ordererType,
                OrderOrg: org.name,
                Addresses: [`${ordererName}.${org.domain_name}:${ordererPort}`],
                Kafka: {
                    Brokers: configtx.kafka
                }
            },
            Organizations: [{
                Name: org.name,
                MspId: org.msp_id,
                Type: common.PEER_TYPE_ORDER
            }]
        };
        if (configtx.ordererType === common.CONSENSUS_KAFKA && (!configtx.kafka || configtx.kafka.length === 0)) {
            throw new Error('kafka config not exists in options');
        } else {
            options.Orderer.Kafka.Brokers = configtx.kafka.map((item) => `${item.host}:${item.port}`);
        }
        if (!configtx.peerOrgs || configtx.peerOrgs.length === 0) {
            throw new Error('peerOrgs config not exists in options');
        } else {
            configtx.peerOrgs.forEach((peerOrg) => {
                options.Organizations.push({
                    Name: peerOrg.name,
                    MspId: peerOrg.mspId,
                    Type: common.PEER_TYPE_PEER,
                    AnchorPeers: [{Host: peerOrg.anchorPeer.host, Port: peerOrg.anchorPeer.port}]
                });
            });
        }

        let configTxYaml = new CreateConfigTx(options).buildConfigtxYaml();
        let genesis = await ConfigTxlator.outputGenesisBlock(common.CONFIFTX_OUTPUT_GENESIS_BLOCK, common.SYSTEM_CHANNEL, configTxYaml, '', '');
        const genesisBlockPath = path.join(config.cryptoConfig.path, String(consortium._id), org.name, 'genesis.block');
        fs.writeFileSync(genesisBlockPath, genesis);

        return genesisBlockPath;
    }
};
