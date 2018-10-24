'use strict';

const PromClient = require('../../services/prometheus/client');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const DbService = require("../../services/db/dao");
const router = require('koa-router')({prefix: '/consortium'});

router.get('/', async ctx => {
    try {
        let consortiums = await DbService.getConsortiums();
        ctx.body = common.success(consortiums, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    let result = {
        id: id,
        name: "",
        consensus_type: 0,
        status: 0,
        create_time: "",
        channel_count: 0,
        org_count: 0,
        peer_count: 0,
        chaincode_count: 0,
    };
    try {
        let consortium = await DbService.getConsortiumById(id);
        if (consortium) {
            result.name = consortium.name;
            result.create_time = consortium.date;
            let channelList = await DbService.getChannelsByCondition({consortium_id: id});
            result.channel_count = channelList.length;
            result.org_count = await DbService.countOrgsByConsortiumId(id);
            result.peer_count = await DbService.countPeersByConsortiumId(id);
            const promClient = new PromClient();
            const memoryMetrics = await promClient.queryMemoryUsage();
            if (memoryMetrics && memoryMetrics.length > 0) {
                for (let idx in memoryMetrics) {
                    let data = memoryMetrics[idx];
                    if (data.metric.container_label_com_docker_compose_container_number > 0) {
                        result.status = 1;
                        break;
                    }
                }
            }
            ctx.body = common.success(result, "success");
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
    let dto = {
        name: ctx.request.body.name,
        config: ctx.request.body.config
    }
    try {
        let consortium = await DbService.addConsortium(dto);
        ctx.body = common.success(consortium, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;
