/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const common = require('../../libraries/common');
const logger = require('../../libraries/log4js');
const ChannelService = require('../../services/fabric/channel/channel');
const DbService = require('../../services/db/dao');
const FabricService = require('../../services/db/fabric');
const Validator = require('../../libraries/validator/validator');
const {BadRequest, SimpleBadRequest} = require('../../libraries/error');
const Schema = require('../../libraries/validator/schema/channel-schema');
const router = require('koa-router')({prefix: '/channel'});

router.get('/:consortiumId', async ctx => {
    let res = Validator.JoiValidate('channel', ctx.params, Schema.getChannelList);
    if (!res.result) throw new SimpleBadRequest(res.message);
    let consortiumId = ctx.params.consortiumId;
    try {
        let channels = await DbService.getChannelsByFilter({consortium_id: consortiumId});
        ctx.body = common.success(channels, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get('/:consortiumId/:id', async ctx => {
    let res = Validator.JoiValidate('channel', ctx.params, Schema.getChannelDetail);
    if (!res.result) throw new SimpleBadRequest(res.message);
    let {consortiumId, id} = ctx.params;
    try {
        let channel = await DbService.getChannelByFilter({consortium_id: consortiumId, _id: id});
        ctx.body = common.success(channel, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

/**
 * fn: add the new channel into fabric network
 */
router.post('/', async ctx => {
    let res = Validator.JoiValidate('channel', ctx.request.body, Schema.createChannel);
    if (!res.result) throw new BadRequest(res.errMsg);

    try {
        let {organizationIds, name} = ctx.request.body;
        let channelService = await ChannelService.getInstance(organizationIds[0], name);
        let configEnvelope = await channelService.createChannel(organizationIds);
        let fabricService = new FabricService(channelService._consortium_id);
        let channel = await fabricService.addChannel({
            name: name,
            orgIds: organizationIds,
            configuration: configEnvelope
        });
        ctx.body = common.success({
            _id: channel._id,
            name: channel.name,
            uuid: channel.uuid,
            date: channel.date
        }, common.SUCCESS);
    } catch (err) {
        logger.error(err.stack ? err.stack : err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

// join peers to channel
router.post('/join', async ctx => {
    let res = Validator.JoiValidate('channel', ctx.request.body, Schema.joinChannel);
    if (!res.result) throw new BadRequest(res.errMsg);

    let {organizationIds, channelId, peers} = ctx.request.body;
    try {
        let channelInfo = await DbService.getChannelById(channelId);
        if (!channelInfo) {
            throw new Error('The channel does not exist.');
        }
        var eventPromises = [];
        for (let orgId of organizationIds) {
            let joinPromise = new Promise(async (resolve, reject) => {
                try {
                    let channelService = await ChannelService.getInstance(orgId, channelInfo.name);
                    resolve(channelService.joinChannel(peers));
                } catch (e) {
                    reject(e.message);
                }
            });
            eventPromises.push(joinPromise);
        }
        await Promise.all(eventPromises).then(async results => {
            let peerIds = [];
            for (let item of results) {
                if (item.peers) {
                    peerIds = peerIds.concat(item.peers);
                }
            }
            let channel = await FabricService.findChannelAndUpdate(channelId, {peers: peerIds});
            ctx.body = common.success({
                _id: channel._id,
                orgs: channel.orgs,
                peers: channel.peers.concat(peerIds)
            }, common.SUCCESS);
        }, err => {
            throw err;
        });
    } catch (err) {
        logger.error(err.stack ? err.stack : err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

// update channel
// channelType: 0-application channel, 1-system channel
// channelType default value 0
router.post('/update', async ctx => {
    let res = Validator.JoiValidate('channel', ctx.request.body, Schema.updateChannel);
    if (!res.result) throw new BadRequest(res.errMsg);

    let {organizationId, channelId, channelType} = ctx.request.body;
    try {
        if (channelType && channelType === 1) {
            let channelService = await ChannelService.getInstance(organizationId);
            // add new org to consortium by update system channel config
            await channelService.updateSysChannel();
            ctx.body = common.success({}, common.SUCCESS);
        } else {
            let channelService = await ChannelService.getInstance(organizationId);
            await channelService.updateAppChannel(channelId);
            let channel = await FabricService.findChannelAndUpdate(channelId, {orgs: [organizationId]});
            ctx.body = common.success({
                _id: channel._id,
                name: channel.name,
                uuid: channel.uuid,
                date: channel.date
            }, common.SUCCESS);
        }
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;
