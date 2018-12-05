/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const DbService = require('../../services/db/dao');
const consortiumService = require('../../services/fabric/consortium');
const Validator = require('../../libraries/validator/validator');
const {BadRequest} = require('../../libraries/error');
const Schema = require('../../libraries/validator/schema/consortium-schema');
const router = require('koa-router')({prefix: '/consortium'});

router.get('/', async ctx => {
    try {
        let consortiums = await DbService.getConsortiums();
        consortiums = consortiums.map(consortium => {
            consortium = consortium.toJSON();
            consortium.network_config = '';
            return consortium;
        });
        ctx.body = common.success(consortiums, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get('/:id', async ctx => {
    let res = Validator.JoiValidate('consortium', ctx.params, Schema.getConsortium);
    if (!res.result) throw new BadRequest(res.errMsg);

    let id = ctx.params.id;
    try {
        let consortium = await DbService.getConsortiumById(id);
        if (consortium) {
            let result = await consortiumService.getConsortiumInfo(id, consortium);
            ctx.body = common.success(result, 'success');
        } else {
            ctx.status = 404;
            ctx.body = common.error({}, 'Consortium not exist');
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.post('/', async ctx => {
    let res = Validator.JoiValidate('consortium', ctx.request.body, Schema.createConsortium);
    if (!res.result) throw new BadRequest(res.errMsg);

    try {
        let consortium = await DbService.addConsortium(ctx.request.body);
        ctx.body = common.success(consortium, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;
