'use strict';
const fs = require('fs');
const path = require('path');
const utils = require('../../libraries/utils');
const env = require('../../env');
const common = require('../../libraries/common');
const DbService = require('../db/dao');
const DockerClient = require('../docker/client');

const ConfigTxlator = require('./configtxlator');
const CreateConfigTx = require('./configtxgen');
const SshProvider = require('../docker/ssh-provider');
const stringUtils = require('../../libraries/string-util');

module.exports = class OrdererService {

    static async get() {
        return await DbService.findOrderes();
    }

    static async findById(id) {
        return await DbService.findOrdererById(id);
    }

    static async create(params) {

        const frontOptions = params.options;
        const {user, password} = params.sshInfo;
        const {organizationId, host, port} = params;

        let org = await DbService.findOrganizationById(organizationId);
        let localDir = path.join(env.cryptoConfig.path, String(org.consortium_id));
        let transferDir = {
            localDir: localDir,
            remoteDir: path.join(env.configtxlator.dataPath, String(org.consortium_id))
        };

        let sshProvider = new SshProvider({
            mode: common.MODES.SSH,
            host: env.configtxlator.connectionOptions.host,
            username: env.configtxlator.connectionOptions.username,
            password: env.configtxlator.connectionOptions.password
        });

        await sshProvider.transferDirectory(transferDir);
        let options = {
            ConsortiumId: String(org.consortium_id),
            Consortium: 'SampleConsortium',
            Orderer: {
                OrdererType: frontOptions.ordererType,
                Addresses: `${frontOptions.orderer.host}:${frontOptions.orderer.port}`,
                Kafka: {
                    Brokers: ['127.0.0.1:9092']
                }
            },
            Organizations: [{
                Name: frontOptions.orderOrg,
                MspId: stringUtils.getMspId(frontOptions.orderOrg),
                Type: common.PEER_TYPE_ORDER
            }]
        };
        if (frontOptions.ordererType === common.CONSENSUS_KAFKE && (!frontOptions.kafka || frontOptions.kafka.length === 0)) {
            throw new Error('kafka not exists in options');
        }else{
            options.Orderer.Kafka.Brokers = frontOptions.kafka.map((item) => `${item.host}:${item.port}`);
        }
        if (!frontOptions.peerOrgs || frontOptions.peerOrgs.length === 0) {
            throw new Error('peerOrgs not exists in options');
        } else {
            frontOptions.peerOrgs.map((org) => {
                options.Organizations.push({
                    Name: org.name,
                    MspId: stringUtils.getMspId(org.name),
                    Type: common.PEER_TYPE_PEER,
                    AnchorPeers: [{Host: org.anchorPeer.host, PORT: org.anchorPeer.port}]
                });
            });
        }

        let configTx = new configTxgen(options).buildGenesisBlock();
        let ordererName = `${org.name}-${host.replace(/\./g, '-')}`;
        let genesis = await ConfigTxlator.outputGenesisBlock(common.CONFIFTX_OUTPUT_GENESIS_BLOCK, common.CONFIFTX_OUTPUT_CHANNEL, configTx, '', '');
        utils.createDir(localDir);
        fs.writeFileSync(path.join(localDir, 'genesis.block'), genesis);

        let connectionOptions = {
            protocol: common.PROTOCOL.HTTP,
            host: host,
            port: port,
            mode: common.MODES.DOCKER
        };
        let parameters = utils.generateOrdererContainerOptions(ordererName);
        const container = await DockerClient.getInstance(connectionOptions).createContainer(parameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${common.PORT_PEER}`);

        if (container) {
            return await DbService.addOrderer({
                name: ordererName,
                organizationId: organizationId,
                location: `${host}:${port}`,
                consortiumId: org.consortium_id
            });
        } else {
            throw new Error('create orderer failed');
        }
    }
};

