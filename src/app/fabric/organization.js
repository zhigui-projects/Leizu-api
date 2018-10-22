'use strict';

const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const mongoose = require('mongoose');
const DbService = require("../../services/db/dao");
const DockerClient = require('../../services/docker/client');
const router = require('koa-router')({prefix: '/organization'});

router.get('/', async ctx => {
    let channelId = ctx.query['channelId'];
    let orgIds = [];
    let orgList = [];
    let orgId = [];
    let orgIdx = [];
    if (channelId) {
        try {
            let channel = await DbService.getChannelById(channelId);
            if (channel) {
                orgIds = channel.orgs;
            }
        } catch (err) {
            ctx.status = 400;
            ctx.body = common.error([], err.message);
        }
    }
    try {
        let organizations = await DbService.getOrganizationsByIds(orgIds);
        if (organizations) {
            for (let i = 0; i < organizations.length; i++) {
                let item = organizations[i];
                orgList.push({
                    id: item._id,
                    name: item.name,
                    consortium_id: item.consortium_id,
                    peer_count: 0
                });
                orgIdx[item._id] = i;
                orgId.push(item._id);
            }
            let peerCounts = await DbService.countPeersByOrg(orgId);
            for (let i = 0; i < peerCounts.length; i++) {
                let idx = orgIdx[peerCounts[i]._id];
                orgList[idx].peer_count = peerCounts[i].total;
            }
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
    ctx.body = common.success(orgList, common.SUCCESS);
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try {
        let organization = DbService.findOrganizationById(id);
        ctx.body = common.success(organization, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post("/", async ctx => {
    let orgDto = {
        name: ctx.request.body.name,
        consortiumId: ctx.request.body.consortiumId
    };
    let isSupported = true;
    try{
        if(isSupported){
            let connectOptions = {
                protocol: 'http',
                host: ctx.request.body.host,
                port: ctx.request.body.port
            };
            let containerOptions = {
                name: ctx.request.body.name,
                domainName: ctx.request.body.domainName
            }
            let parameters = utils.generateCertAuthContainerOptions(containerOptions);
            await DockerClient.getInstance(connectOptions).createContainer(parameters);
        }
        let organization = await DbService.addOrganization(orgDto);
        ctx.body = common.success(organization, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;