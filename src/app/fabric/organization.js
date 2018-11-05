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
    let name = ctx.request.body.name;
    let consortiumId = ctx.request.body.consortiumId;
    let orgDto = {
        name: name,
        mspId: stringUtil.getMspId(name),
        consortiumId: consortiumId
    };
    let certAuthDto = {
        name: stringUtil.getCaName(name),
        consortiumId: consortiumId
    }
    let isSupported = true;
    try {
        if (isSupported) {
            let connectOptions = {
                protocol: common.PROTOCOL_HTTP,
                host: ctx.request.body.host,
                port: ctx.request.body.port
            };
            let containerOptions = {
                name: name,
                domainName: ctx.request.body.domainName
            }
            let parameters = utils.generateCertAuthContainerOptions(containerOptions);
            let container = await DockerClient.getInstance(connectOptions).createContainer(parameters);
            if(container){
                let options = {
                    caName: stringUtil.getCaName(name),
                    orgName: name,
                    url: stringUtil.getUrl(common.PROTOCOL_HTTP,ctx.request.body.host,common.PORT_CA)
                };
                let cryptoCaService = new CryptoCaService(options);
                let result = await cryptoCaService.postContainerStart();
                if(result){
                    orgDto.adminKey = result.enrollment.key.toBytes();
                    orgDto.adminCert = result.enrollment.certificate;
                }
                certAuthDto.url = options.url;
            }
        }
        let organization = await DbService.addOrganization(orgDto);
        if(organization){
            certAuthDto.ordId = organization._id;
            let certAuthority = await DbService.addCertAuthority(certAuthDto);
            organization.ca = certAuthority;
        }
        ctx.body = common.success(organization, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;