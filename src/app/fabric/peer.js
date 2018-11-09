'use strict';

const PeerService = require('../../services/fabric/peer');
const common = require('../../libraries/common');
const logger = require('../../libraries/log4js');
const router = require('koa-router')({prefix: '/peer'});

router.get('/', async ctx => {
    try {
        const peerDetails = await PeerService.list(ctx.query['organizationId']);
        ctx.body = common.success(peerDetails, common.SUCCESS);
    } catch (ex) {
        logger.error(ex);
        ctx.status = 400;
        ctx.body = common.error(null, ex.message);
    }
});

router.get('/:id', async ctx => {
    try {
        const peer = PeerService.findById(ctx.params.id);
        ctx.body = common.success(peer, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/', async ctx => {
    try {
        const peer = await PeerService.create(ctx.request.body);
        ctx.body = common.success(peer, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.put('/:id', async ctx => {
    const id = ctx.params.id;
    try {
        await PeerService.joinChannel(id, ctx.request.body);
        ctx.body = common.success({id: id}, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;