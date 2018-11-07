'use strict';

const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const stringUtil = require('../../libraries/string-util');
const DbService = require('../../services/db/dao');
const DockerClient = require('../../services/docker/client');
const CryptoCaService = require('../../services/fabric/crypto-ca');
const router = require('koa-router')({prefix: '/organization'});

router.get('/', async ctx => {
    let channelId = ctx.query['channelId'];
    let orgIds = [];
    let orgList = [];
    let orgId = [];
    if (channelId) {
        try {
            let channel = await DbService.getChannelById(channelId);
            if (channel) {
                orgIds = channel.orgs;
            }
        } catch (err) {
            ctx.status = 400;
            ctx.body = common.error([], err.message);
        }
    }
    try {
        let organizations = await DbService.getOrganizationsByIds(orgIds);
        if (organizations) {
            orgId = organizations.map(item => {
                orgList.push({id: item._id, name: item.name, consortium_id: item.consortium_id, peer_count: 0});
                return item._id;
            });
            let peerCounts = await DbService.countPeersByOrg(orgId);
            orgId = orgId.map(id => String(id));
            peerCounts.map(item => {
                let idx = orgId.indexOf(String(item._id));
                orgList[idx].peer_count = item.total;
            });
            ctx.body = common.success(orgList, common.SUCCESS);
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try {
        let organization = DbService.findOrganizationById(id);
        ctx.body = common.success(organization, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post("/", async ctx => {
    const {name, consortiumId, domainName, host, port, username, password} = ctx.request.body;
    let orgDto = {
        name: name,
        mspId: stringUtil.getMspId(name),
        consortiumId: consortiumId
    };
    let certAuthDto = {
        name: stringUtil.getCaName(name),
        consortiumId: consortiumId
    };
    try {
        let containerOptions = {
            name: name,
            domainName: domainName,
            port: common.PORT_CA
        };
        let parameters, connectOptions = null;
        if (ctx.app.config.docker.enabled) {
            connectOptions = {
                protocol: common.PROTOCOL_HTTP,
                host: host,
                port: port || ctx.app.config.docker.port
            };
            parameters = utils.generateCertAuthContainerOptions(containerOptions);
        } else {
            connectOptions = {
                username: username,
                password: password,
                host: host,
                port: port
            };
            parameters = utils.generateCertAuthContainerCreateOptions(containerOptions);
        }

        let container = await DockerClient.getInstance(connectOptions).createContainer(parameters);
        if (container) {
            let options = {
                caName: stringUtil.getCaName(name),
                orgName: name,
                url: stringUtil.getUrl(common.PROTOCOL_HTTP, host, common.PORT_CA)
            };
            let cryptoCaService = new CryptoCaService(options);
            let result = await cryptoCaService.postContainerStart();
            if (result) {
                orgDto.adminKey = result.enrollment.key.toBytes();
                orgDto.adminCert = result.enrollment.certificate;
                orgDto.rootCert = result.enrollment.rootCertificate;
            }
            certAuthDto.url = options.url;
        }
        let organization = await DbService.addOrganization(orgDto);
        if (organization) {
            certAuthDto.ordId = organization._id;
            organization.ca = await DbService.addCertAuthority(certAuthDto);
        }
        ctx.body = common.success(organization, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;