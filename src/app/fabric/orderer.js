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
    const {user, password} = ctx.request.body.sshInfo;
    const {organizationId, host, port} = ctx.request.body;
    try {
        const org = await DbService.findOrganizationById(organizationId);
        const ordererName = `${org.name}-${host.replace(/\./g, '-')}`;
        let configTx = fs.readFileSync(path.join(__dirname, env.configTx.path));
        let genesis = await Configtxlator.outputGenesisBlock('OrgsOrdererGenesis', 'OrgsChannel', configTx, '', '');
        fs.writeFileSync(path.join(__dirname, env.gensisFileSaveDir.path,'genesis.block'), genesis);
        let connectionOptions = {
            protocol: common.PROTOCOL_HTTP,
            host: host,
            port: port
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

module.exports = router;