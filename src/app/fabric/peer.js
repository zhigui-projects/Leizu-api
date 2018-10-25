'use strict';

const DbService = require('../../services/db/dao');
const PromClient = require('../../services/prometheus/client');
const PeerService = require('../../services/fabric/peer');
const common = require('../../libraries/common');
const DockerClient = require('../../services/docker/client');
const utils = require('../../libraries/utils');
const router = require('koa-router')({prefix: '/peer'});

router.get('/', async ctx => {
    try {
        const {peers, channels, organizations} = await queryDetails(ctx.query['organizationId']);
        const promClient = new PromClient();
        const cpuMetrics = await promClient.queryCpuUsage();
        const memoryMetrics = await promClient.queryMemoryUsage();

        const peerDetails = peers.map((peer) => {
            const org = organizations.find(org => String(peer.org_id) == String(org._id) );
            let organizationName = (org && org.name) || null;
            let channelNames = channels.filter(channel => channel.peers.includes(peer._id))
                .map(channel => channel.name);
            let cpu = cpuMetrics.find(data => peer.location.includes(data.metric.name)).value[1];
            let memory = memoryMetrics.find(data => peer.location.includes(data.metric.name)).value[1];

            //TODO: need to detect docker container status
            let status = 'running';
            return {...peer.toJSON(), organizationName, channelNames, status, cpu, memory};
        });
        ctx.body = common.success(peerDetails, common.SUCCESS);
    } catch (ex) {
        ctx.status = 400;
        ctx.body = common.error(null, ex.message);
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

router.post("/", async ctx => {
    let peerDto = {
        name: ctx.request.body.name,
        organizationId: ctx.request.body.organizationId,
        location: ctx.request.body.host + ":" + ctx.request.body.port
    };
    let isSupported = false;
    try{
        if(isSupported){
            let connectOptions = {
                protocol: 'http',
                host: ctx.request.body.host,
                port: ctx.request.body.port
            };
            let containerOptions = {
                name: ctx.request.body.name,
                peerId: ctx.request.body.peerId,
                endpoint: ctx.request.body.endpoint,
                mspid: ctx.request.body.mspid
            };
            let parameters = utils.generatePeerContainerOptions(containerOptions);
            await DockerClient.getInstance(connectOptions).createContainer(parameters);
        }
        let peer = await DbService.addPeer(peerDto);
        ctx.body = common.success(peer, common.SUCCESS);
    }catch(err){
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