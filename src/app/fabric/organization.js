'use strict';

const common = require('../../libraries/common');
const DbService = require("../../services/db/dao");
const DockerClient = require('../../services/docker/client')
const router = require('koa-router')({prefix: '/organization'});

router.get('/', async ctx => {
    try{
        let organizations = DbService.findOrganizations();
        ctx.body = common.success(organizations, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error([], err.message);        
    }
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try{
        let organization = DbService.findOrganizationById(id);
        ctx.body = common.success(organization, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);        
    }
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
        let organization = await DbService.addOrganization(orgDto);
        ctx.body = common.success(organization, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;