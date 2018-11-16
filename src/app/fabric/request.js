'use strict';

const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const RequestHandler = require('../../services/handler/request');
const router = require('koa-router')({prefix: '/request'});

router.post('/', async ctx => {
    try {
        let requestHandler = new RequestHandler(ctx);
        let request = await requestHandler.handle();
        let simpleRequest = request.toObject();
        let simpleResponse = {
            id: simpleRequest._id,
            name: simpleRequest.name
        };
        ctx.body = common.success(simpleResponse, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message || err);
    }
});

module.exports = router;