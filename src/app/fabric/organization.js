'use strict';

const Organization = require('../../models/organization');
const common = require('../../libraries/common');
const FabricService = require('../../services/db/fabric');
const DockerClient = require('../../services/docker/client')

const router = require('koa-router')({prefix: '/organization'});
router.get('/', async ctx => {
    await Organization.find({}, (err, docs) => {
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
    await Organization.findById(id, (err, doc) => {
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

router.post("/", async ctx => {
    let orgDto = {
        name: ctx.request.body.name,
    }
    try{
        // call the docker service to start one remote ca daemon process
        let connectOptions = {};
        let parameters = {};
        await DockerClient.getInstance(connectOptions).createContainer(parameters);
        let fabricService = new FabricService();
        let organization = await fabricService.addOrganization(orgDto);
        ctx.body = common.success(organization, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});
module.exports = router;