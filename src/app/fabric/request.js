'use strict';

const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const RequestHandler = require('../../services/handler/request');
const router = require('koa-router')({prefix: '/request'});
const {BadRequest} = require('../../libraries/error');
const Validator = require('../../libraries/validator/validator');
const Schema = require('../../libraries/validator/schema/request-schema');

router.post('/', async ctx => {
    let res = Validator.JoiValidate('request', ctx.request.body, Schema.requestSchema);
    if (!res.result) throw new BadRequest(res.errMsg);
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
