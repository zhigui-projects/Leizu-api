'use strict';

const router = require('koa-router')();
const logger = require('../../libraries/log4js');
const Consortium = require('../../models/consortium');
const syncService = require('../../services/fabric/synchronize');
const common = require('../../libraries/common');
const Validator = require('../../libraries/validator/validator');
const {BadRequest} = require('../../libraries/error');
const Schema = require('../../libraries/validator/request-schema/consortium-schema');

router.post('/fabric/sync/:id', async ctx => {
    let res = Validator.JoiValidate('synchronization', ctx.params.id, Schema.consortiumId);
    if (!res.result) throw new BadRequest(res.errMsg);

    let consortiumId = ctx.params.id;
    logger.debug('The consortium id is %s', consortiumId);
    try {
        let consortium = await Consortium.findById(consortiumId);
        if (consortium) {
            if (consortium.synced) {
                ctx.body = common.success([], common.SYNC_SUCCESS);
            } else {
                let network_config = JSON.parse(consortium.network_config);
                let result = await syncService.syncFabric(consortiumId, network_config);
                consortium = await Consortium.findByIdAndUpdate(consortiumId, {synced: true});
                consortium.synced = true;
                result.push(consortium);
                ctx.body = common.success(result, common.SYNC_SUCCESS);
            }
        } else {
            ctx.response.status = 400;
            ctx.body = common.error([], 'The consortium does not exist.');
        }
    } catch (err) {
        ctx.response.status = 400;
        ctx.body = common.error([], err.message);
    }
});

module.exports = router;
