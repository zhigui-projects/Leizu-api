'use strict';

const common = require('../../libraries/common');
const DbService = require('../../services/db/dao');
const OrganizationService = require('../../services/fabric/organization');
const router = require('koa-router')({prefix: '/organization'});

const {BadRequest} = require('../../libraries/error');
const Validator = require('../../libraries/validator/validator');
const Schema = require('../../libraries/validator/request-schema/organization-shcema');

router.get('/', async ctx => {
    let channelId = ctx.query['channelId'];
    let orgIds = [];
    let orgList = [];
    let orgId = [];
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
            orgId = organizations.map(item => {
                orgList.push({id: item._id, name: item.name, consortium_id: item.consortium_id, peer_count: 0});
                return item._id;
            });
            let peerCounts = await DbService.countPeersByOrg(orgId);
            orgId = orgId.map(id => String(id));
            peerCounts.map(item => {
                let idx = orgId.indexOf(String(item._id));
                orgList[idx].peer_count = item.total;
            });
            ctx.body = common.success(orgList, common.SUCCESS);
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
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

router.post('/', async ctx => {
    let res = Validator.JoiValidate('create orderer', ctx.request.body, Schema.newOrganizationSchema);
    if (!res.result) throw new BadRequest(res.errMsg);
    try {
        let organization = await OrganizationService.create(ctx.request.body);
        ctx.body = common.success({
            _id: organization._id,
            name: organization.name,
            msp_id: organization.msp_id,
            msp_path: organization.msp_path,
            uuid: organization.uuid,
            date: organization.date
        }, common.SUCCESS);
    } catch (err) {
        console.log('error: ', err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;