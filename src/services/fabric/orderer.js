'use strict';
const fs = require('fs');
const path = require('path');
const {HFCAIdentityType} = require('fabric-ca-client/lib/IdentityService');
const utils = require('../../libraries/utils');
const env = require('../../env');
const common = require('../../libraries/common');
const stringUtils = require('../../libraries/string-util');
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
        const {organizationId, username, password, host, port, options} = params;

        const org = await DbService.findOrganizationById(organizationId);
        const ordererName = `orderer-${host.replace(/\./g, '-')}`;
        const ordererPort = common.PORT.ORDERER;

        let containerOptions = {
            workingDir: `${common.ORDERER_HOME}/${org.consortium_id}/${org.name}`,
            peerName: ordererName,
            domainName: org.domain_name,
            mspid: org.msp_id,
            port: ordererPort
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

        const ordererDto = await this.preContainerStart({org, ordererName, connectionOptions, options});

        const client = DockerClient.getInstance(connectionOptions);
        const parameters = utils.generateOrdererContainerOptions(containerOptions, connectionOptions.mode);
        const container = await client.createContainer(parameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${ordererPort}`);
        if (container) {
            return await DbService.addOrderer(Object.assign({}, ordererDto, {
                name: ordererName,
                organizationId: organizationId,
                location: `${host}:${ordererPort}`,
                consortiumId: org.consortium_id,
            }));
        } else {
            throw new Error('create orderer failed');
        }
    }

    static async preContainerStart({org, ordererName, connectionOptions, options}) {
        await this.createContainerNetwork(connectionOptions);
        let ordererDto = await this.prepareCerts(org, ordererName);
        const genesisBlockFile = await this.prepareGenesisBlock(org, options);

        const certFile = `${ordererDto.credentialsPath}.zip`;
        const remoteFile = `${common.ORDERER_HOME}/${org.consortium_id}/${org.name}.zip`;
        const remotePath = `${common.ORDERER_HOME}/${org.consortium_id}/${org.name}`;
        await DockerClient.getInstance(connectionOptions).transferFile({
            local: certFile,
            remote: remoteFile
        });
        await DockerClient.getInstance(connectionOptions).transferFile({
            local: genesisBlockFile,
            remote: remoteFile
        });
        const bash = DockerClient.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));
        await bash.exec(['-c', `mkdir -p ${remotePath}/msp ${remotePath}/tls`]);
        await bash.exec(['-c', `unzip -o ${remoteFile} -d ${remotePath}/msp`]);
        await bash.exec(['-c', `cp ${remotePath}/msp/tls/cert.pem ${remotePath}/tls/server.crt`]);
        await bash.exec(['-c', `cp ${remotePath}/msp/tls/key.pem ${remotePath}/tls/server.key`]);
        await bash.exec(['-c', `cp ${remotePath}/msp/cacerts/ca-cert.pem ${remotePath}/tls/ca.pem`]);

        return ordererDto;
    }

    static async createContainerNetwork(connectionOptions) {
        const parameters = utils.generateContainerNetworkOptions({name: common.DEFAULT_NETWORK.NAME});
        await DockerClient.getInstance(connectionOptions).createContainerNetwork(parameters);
    }

    static async prepareCerts(org, ordererName) {
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
            consortiumId: org.consortium_id.toString(),
            tls: {}
        };
        ordererDto.signkey = mspInfo.key.toBytes();
        ordererDto.signCert = mspInfo.certificate;
        ordererDto.adminCert = org.admin_cert;
        ordererDto.rootCert = org.root_cert;
        ordererDto.tls.key = tlsInfo.key.toBytes();
        ordererDto.tls.cert = tlsInfo.certificate;
        ordererDto.credentialsPath = await CredentialHelper.storeCredentials(ordererDto);
        return ordererDto;
    }

    static async prepareGenesisBlock(org, configtx) {
        let options = {
            ConsortiumId: String(org.consortium_id),
            Consortium: 'SampleConsortium',
            Orderer: {
                OrdererType: configtx.ordererType,
                Addresses: `${configtx.orderer.host}:${configtx.orderer.port}`,
                Kafka: {
                    Brokers: ['127.0.0.1:9092']
                }
            },
            Organizations: [{
                Name: org.name,
                MspId: org.msp_id,
                Type: common.PEER_TYPE_ORDER
            }]
        };
        if (configtx.ordererType === common.CONSENSUS_KAFKE && (!configtx.kafka || configtx.kafka.length === 0)) {
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
                    MspId: stringUtils.getMspId(peerOrg.name),
                    Type: common.PEER_TYPE_PEER,
                    AnchorPeers: [{Host: peerOrg.anchorPeer.host, Port: peerOrg.anchorPeer.port}]
                });
            });
        }

        let configTxYaml = new CreateConfigTx(options).buildConfigtxYaml();
        let genesis = await ConfigTxlator.outputGenesisBlock(common.CONFIFTX_OUTPUT_GENESIS_BLOCK, common.CONFIFTX_OUTPUT_CHANNEL, configTxYaml, '', '');
        const genesisBlockPath = path.join(env.cryptoConfig.path, org.consortium_id, org.name, 'genesis.block');
        fs.writeFileSync(genesisBlockPath, genesis);

        return genesisBlockPath;
    }
};
