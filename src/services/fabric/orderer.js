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

module.exports = class OrdererService {

    static async get(){
        return await DbService.findOrderes();
    }

    static async findById(id){
        return await DbService.findOrdererById(id);
    }

    static async create(params) {
        const configTxOptions = params.options;
        const {user, password} = params.sshInfo;
        const {organizationId, host, port} = params;

        let transferDir = {
            localDir: path.join(__dirname, env.mspFile.localDir),
            remoteDir: env.mspFile.serverDir
        };
        let sshProvider = new SshProvider({
            mode: common.MODES.SSH,
            host: env.configtxlator.host,
            username: env.configtxlator.username,
            password: env.configtxlator.password
        });
        await sshProvider.transferDirectory(transferDir);

        let configTxPath = new CreateConfigTx(configTxOptions).buildGenesisConfigTxFile();
        let org = await DbService.findOrganizationById(organizationId);
        let ordererName = `${org.name}-${host.replace(/\./g, '-')}`;
        let configTx = fs.readFileSync(configTxPath);
        let genesis = await ConfigTxlator.outputGenesisBlock(env.genesisProfile, env.genesisChannel, configTx, '', '');
        let genesisBlockPath = path.join(__dirname, env.genesisFileSaveDir.path);
        checkDirExistAndMake(genesisBlockPath);
        fs.writeFileSync(path.join(__dirname, env.genesisFileSaveDir.path, organizationId + 'genesis.block'), genesis);

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

function checkDirExistAndMake(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}
