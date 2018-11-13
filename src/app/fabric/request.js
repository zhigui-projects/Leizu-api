'use strict';

const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const RequestHandler = require('../../services/handler/request');
const router = require('koa-router')({prefix: '/request'});

router.post('/', async ctx => {
    try {
        let requestHandler = new RequestHandler(ctx);
        let consortium = await requestHandler.handle(ctx);
        ctx.body = common.success(consortium, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;