'use strict';

const common = require('../../libraries/common');
const OrdererService = require('../../services/fabric/orderer');
const router = require('koa-router')({prefix: '/orderer'});
const logger = require('log4js').getLogger();

router.get('/', async ctx => {
    try {
        const orderers = OrdererService.get();
        ctx.body = common.success(orderers, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get('/:id', async ctx => {
    try {
        const orderer = await OrdererService.findById(ctx.params.id);
        ctx.body = common.success(orderer, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/', async ctx => {
    try {
        //TODO: check whether image is provided or supported

        const order = await OrdererService.create(ctx.request.body);
        ctx.body = common.success(order, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});


module.exports = router;
