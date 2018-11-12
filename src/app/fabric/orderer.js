'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('../../libraries/utils');
const env = require('../../env');
const Orderer = require('../../models/orderer');
const common = require('../../libraries/common');
const DbService = require('../../services/db/dao');
const DockerClient = require('../../services/docker/client');
const Configtxlator = require('../../services/fabric/configtxlator');
const CreateConfigtx = require('../../services/fabric/create-configtx');
const SshProvider = require('../../services/docker/ssh-provider');


const router = require('koa-router')({prefix: '/orderer'});
router.get('/', async ctx => {
    await Orderer.find({}, (err, docs) => {
        if (err) {
            ctx.body = common.error([], err.message);
        } else {
            ctx.body = common.success(docs, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    });
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    await Orderer.findById(id, (err, doc) => {
        if (err) {
            ctx.body = common.error({}, err.message);
        } else {
            ctx.body = common.success(doc, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    });
});

router.post('/', async ctx => {
    let configtxOptions = ctx.request.body.options;
    const {user, password} = ctx.request.body.sshInfo;
    const {organizationId, host, port} = ctx.request.body;
    try {
        let configtxPath = new CreateConfigtx(configtxOptions).buildGenesisConfigTxFile();
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
        const org = await DbService.findOrganizationById(organizationId);
        const ordererName = `${org.name}-${host.replace(/\./g, '-')}`;
        let configTx = fs.readFileSync(configtxPath);
        let genesis = await Configtxlator.outputGenesisBlock(env.genesisProfile, env.genesisChannel, configTx, '', '');
        let genesisBlockPath = path.join(__dirname, env.genesisFileSaveDir.path);
        checkDirExistAndMake(genesisBlockPath);
        fs.writeFileSync(path.join(__dirname, env.genesisFileSaveDir.path, organizationId + 'genesis.block'), genesis);
        let connectionOptions = {
            protocol: common.PROTOCOL_HTTP,
            host: host,
            port: port,
            mode: common.MODES.DOCKER
        };
        let parameters = utils.generateOrdererContainerOptions(ordererName);
        await DockerClient.getInstance(connectionOptions).createContainer(parameters);
        const orderer = await DbService.addOrderer({
            name: ordererName,
            organizationId: organizationId,
            location: `${host}:${port}`,
            consortiumId: org.consortium_id
        });
        ctx.body = common.success(orderer, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

function checkDirExistAndMake(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

module.exports = router;