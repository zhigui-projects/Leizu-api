/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const common = require('../../libraries/common');
const OrdererService = require('../../services/fabric/orderer');
const router = require('koa-router')({prefix: '/orderer'});
const logger = require('log4js').getLogger();

const {BadRequest} = require('../../libraries/error');
const Validator = require('../../libraries/validator/validator');
const Schema = require('../../libraries/validator/schema/orderer-schema');

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
    let res = Validator.JoiValidate('create orderer', ctx.request.body, Schema.newOrdererSchema);
    if (!res.result) throw new BadRequest(res.errMsg);
    try {
        const order = await OrdererService.create(ctx.request.body);
        ctx.body = common.success(order, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});


module.exports = router;
