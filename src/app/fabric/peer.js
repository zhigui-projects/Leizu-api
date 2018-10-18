'use strict';

const DbService = require('../../services/db/dao');
const PromClient = require('../../services/prometheus/client');
const PeerService = require('../../services/fabric/peer');
const common = require('../../libraries/common');
const router = require('koa-router')({prefix: '/peer'});

router.get('/', async ctx => {
    try {
        const {peers, channels, organizations} = await queryDetails(ctx.query['organizationId']);
        const promClient = new PromClient();
        const cpuMetrics = await promClient.queryCpuUsage();
        const memoryMetrics = await promClient.queryMemoryUsage();

        peers.forEach((peer) => {
            const org = organizations.find(org => peer.org_id === org._id);
            if (org) {
                peer.organizationName = org.name;
            }
            peer.channelNames = channels.filter(channel => channel.peers.includes(peer._id))
                .map(channel => channel.name).join(',');
            peer.cpu = cpuMetrics.find(data => data.metric.instance === peer.location).value[1];
            peer.memory = memoryMetrics.find(data => data.metric.instance === peer.location).value[1];
        });
        ctx.body = common.success(peers, common.SUCCESS);
    } catch (ex) {
        ctx.body = common.error([], ex);
    }
});

const queryDetails = async (orgId) => {
    let peers, channels, organizations = [];
    if (orgId) {
        peers = await DbService.findPeersByOrgId(orgId);
        organizations = await DbService.findOrganizationById(orgId);
    } else {
        peers = await DbService.findPeers();
        organizations = await DbService.findOrganizations();

    }
    channels = await DbService.getChannels();
    return {peers, channels, organizations};
};

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try {
        let peer = await DbService.findPeerById(id);
        ctx.body = common.success(peer, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});


/**
 * fn: add the peer into channel by join request
 * parameters: to-be-specified
 *
 */
router.put("/:id", async ctx => {
    let id = ctx.params.id;
    let params = ctx.request.body;
    try {
        let peerService = new PeerService();
        await peerService.joinChannel(id, params);
        ctx.body = common.success({id: id}, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;