'use strict';

const DbService = require('../../services/db/dao');
const PromClient = require('../../services/prometheus/client');
const PeerService = require('../../services/fabric/peer');
const CredentialHelper = require('../../services/fabric/credential-helper');
const DockerClient = require('../../services/docker/client');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const logger = require('../../libraries/log4js');
const router = require('koa-router')({prefix: '/peer'});

router.get('/', async ctx => {
    try {
        const {peers, channels, organizations} = await queryDetails(ctx.query['organizationId']);
        const promClient = new PromClient();
        const cpuMetrics = await promClient.queryCpuUsage();
        const memoryMetrics = await promClient.queryMemoryUsage();

        const peerDetails = peers.map((peer) => {
            let org = organizations;
            if (!ctx.query['organizationId']) {
                org = organizations.find(org => org._id.equals(peer.org_id));
            }
            let organizationName = (org && org.name) || null;
            let channelNames = channels.filter(channel => channel.peers.some(id => peer._id.equals(id)))
                .map(channel => channel.name);
            let cpuMetric = cpuMetrics.find(data => peer.location.includes(data.metric.name));
            let cpu = 0;
            if (cpuMetric) {
                cpu = cpuMetric.value[1];
            }
            let memoryMetric = memoryMetrics.find(data => peer.location.includes(data.metric.name));
            let memory = 0;
            if (memoryMetric) {
                memory = memoryMetric.value[1];
            }
            //TODO: need to detect docker container status
            let status = 'running';
            return {...peer.toJSON(), organizationName, channelNames, status, cpu, memory};
        });
        ctx.body = common.success(peerDetails, common.SUCCESS);
    } catch (ex) {
        logger.error(ex);
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

router.post('/', async ctx => {
    const {organizationId, username, password, host, port} = ctx.request.body;
    try {
        const org = await DbService.findOrganizationById(organizationId);
        const peerName = `${org.name}-${host.replace(/\./g, '-')}`;
        let containerOptions = {
            workingDir: common.PEER_HOME,
            peerName: peerName,
            mspid: org.msp_id,
            port: common.PORT_PEER
        };

        let connectionOptions, parameters = null;
        if (ctx.app.config.docker.enabled) {
            connectionOptions = {
                mode: common.MODES.DOCKER,
                protocol: common.PROTOCOL_HTTP,
                host: host,
                port: port || ctx.app.config.docker.port
            };
            parameters = utils.generatePeerContainerOptions(containerOptions);
        } else {
            connectionOptions = {
                mode: common.MODES.SSH,
                host: host,
                username: username,
                password: password,
                port: port || ctx.app.config.ssh.port
            };
            parameters = utils.generatePeerContainerCreateOptions(containerOptions);
        }

        const certs = {
            adminKey: org.admin_key,
            adminCert: org.admin_cert,
            rootCert: org.root_cert
        };
        const certPath = await CredentialHelper.storeCredentials(org.msp_id, certs);
        const client = DockerClient.getInstance(connectionOptions);
        const remotePath = `${common.PEER_HOME}/${org.msp_id}.zip`;
        await client.transferFile({
            local: certPath,
            remote: remotePath
        });
        await DockerClient.getInstance(Object.assign(connectionOptions, {cmd: 'unzip'})).exec([
            '-o', remotePath, '-d', `${common.PEER_HOME}/data/msp`
        ]);
        await DockerClient.getInstance(Object.assign(connectionOptions, {cmd: 'mkdir'})).exec([
            '-p', `${common.PEER_HOME}/data/tls`
        ]);
        await DockerClient.getInstance(Object.assign(connectionOptions, {cmd: 'bash'})).exec([
            '-c', `cp ${common.PEER_HOME}/data/msp/signcerts/* ${common.PEER_HOME}/data/tls/server.crt`
        ]);
        await DockerClient.getInstance(Object.assign(connectionOptions, {cmd: 'bash'})).exec([
            '-c', `cp ${common.PEER_HOME}/data/msp/keystore/* ${common.PEER_HOME}/data/tls/server.key`
        ]);
        await DockerClient.getInstance(Object.assign(connectionOptions, {cmd: 'bash'})).exec([
            '-c', `cp ${common.PEER_HOME}/data/msp/cacerts/* ${common.PEER_HOME}/data/tls/ca.pem`
        ]);

        const container = await client.createContainer(parameters);
        if (container) {
            const peer = await DbService.addPeer({
                name: peerName,
                organizationId: organizationId,
                location: `${host}:${port}`
            });
            ctx.body = common.success(peer, common.SUCCESS);
        } else {
            throw new Error('create peer failed');
        }
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});


/**
 * fn: add the peer into channel by join request
 * parameters: to-be-specified
 *
 */
router.put('/:id', async ctx => {
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