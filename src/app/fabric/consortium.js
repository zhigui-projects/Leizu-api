'use strict';

const PromClient = require('../../services/prometheus/client');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const DbService = require("../../services/db/dao");
const query = require('../../services/fabric/query');
const router = require('koa-router')({prefix: '/consortium'});

router.get('/', async ctx => {
    try {
        let consortiums = await DbService.getConsortiums();
        consortiums=consortiums.map(consortium=>{
            consortium=consortium.toJSON();
            consortium.network_config='';
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
    let id = ctx.params.id;
    let result = initConsortiumDetail(id);
    try {
        let consortium = await DbService.getConsortiumById(id);
        let networkConfig = JSON.parse(consortium.network_config);
        let peerConfig = networkConfig.peerConfig;
        let caConfig = networkConfig.caConfig;
        if (consortium) {
            result.name = consortium.name;
            result.type = consortium.type;
            result.create_time = consortium.date;
            let channelList = await DbService.getChannelsByCondition({consortium_id: id});
            result.channel_count = channelList.length;
            if (result.channel_count > 0) {
                result.consensus_type = getConsensusType(channelList[0]);
            }
            channelList.map(async channel => {
                let chaincodes = await query.getInstanceChaincodes(channel.name, peerConfig, caConfig);
                result.chaincode_count += chaincodes.length;
            });
            result.org_count = await DbService.countOrgsByConsortiumId(id);
            result.peer_count = await DbService.countPeersByConsortiumId(id);
            result.status = await getNetworkStatus();
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

const initConsortiumDetail = (id) => {
    return {
        id: id,
        name: "",
        type: "",
        consensus_type: 0,
        status: 0,
        create_time: "",
        channel_count: 0,
        org_count: 0,
        peer_count: 0,
        chaincode_count: 0,
    };
};

const getConsensusType = (channel) => {
    let channelConfig = channel.configuration;
    let channelConfigObject = JSON.parse(channelConfig);
    let consensusType = channelConfigObject.groups.Orderer.values.ConsensusType.value.type;
    if (consensusType === common.CONSENSUS_SOLO) {
        return common.CONSENSUS_SOLO_VALUE;
    } else if (consensusType === common.CONSENSUS_KAFKE) {
        return common.CONSENSUS_KAFKA_VALUE;
    }
};

const getNetworkStatus = async () => {
    const promClient = new PromClient();
    const memoryMetrics = await promClient.queryMemoryUsage();
    if (memoryMetrics && memoryMetrics.length > 0) {
        for (let idx in memoryMetrics) {
            let data = memoryMetrics[idx];
            if (data.metric.container_label_com_docker_compose_container_number > 0) {
                return 1;
            }
        }
    }
    return 0;
};

module.exports = router;
