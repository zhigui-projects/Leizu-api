'use strict';

const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const Validator = require('../../libraries/validator/validator');
const {BadRequest} = require('../../libraries/error');
const Schema = require('../../libraries/validator/schema/consortium-schema');
const DbService = require('../../services/db/dao');
const router = require('koa-router')({prefix: '/container'});

router.get("/", async ctx => {
    let res = Validator.JoiValidate('container', ctx.query['consortiumId'], Schema.consortiumId);
    if (!res.result) throw new BadRequest(res.errMsg);

    let consortiumId = ctx.query['consortiumId'];
    try {
        let peers = await DbService.findPeers();
        if(consortiumId){
            peers = peers.filter(peer => String(peer.consortium_id) == consortiumId);
        }
        let dataSet = [];
        for(let peer of peers){
            dataSet.push({id: peer._id, name: peer.name});
        }
        ctx.body = common.success(dataSet, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

module.exports = router;
