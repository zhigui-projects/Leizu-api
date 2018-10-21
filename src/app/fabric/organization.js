'use strict';

const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Channel=require('../../models/channel');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const mongoose = require('mongoose');
const DbService = require("../../services/db/dao");
const DockerClient = require('../../services/docker/client');
const router = require('koa-router')({prefix: '/organization'});

router.get('/', async ctx => {
    let channelId = ctx.query.channelId;
    let where = {};

    if(channelId){
        await new Promise((resolve)=>{
            Channel.findOne({_id: mongoose.Types.ObjectId(channelId)},function (err, channel) {
                if(!err&&channel){
                    where={_id:{$in:channel.orgs}}
                }
                resolve();
            });
        })
    }
    let orgList = [];
    let orgId = [];
    let orgIdx = [];
    await new Promise((resolve) => {
        Organization.find(where, async (err, docs) => {
            if (err) {
                ctx.body = common.error(orgList, err.message);
                resolve(orgList);
            } else {
                for (let i = 0; i < docs.length; i++) {
                    orgList.push({
                        id: docs[i]._id,
                        name: docs[i].name,
                        consortium_id: docs[i].consortium_id,
                        peer_count: 0
                    });
                    orgIdx[docs[i]._id] = i;
                    orgId.push(docs[i]._id);
                }
                resolve(orgList);
            }
        }).catch(err => {
            ctx.status = 400;
            ctx.body = common.error(orgList, err.message);
            resolve(orgList);
        });
    });
    await new Promise((resolve) => {
        Peer.aggregate([
                {$match: {"org_id": {$in: orgId}}},
                {
                    $group: {
                        _id: "$org_id",
                        total: {$sum: 1}
                    }
                }
            ]
            , function (err, result) {
                if (!err) {
                    for (let i = 0; i < result.length; i++) {
                        let idx = orgIdx[result[i]._id];
                        orgList[idx].peer_count = result[i].total;
                    }
                    ctx.body = common.success(orgList, common.SUCCESS);
                    resolve(orgList);
                } else {
                    ctx.body = common.error(orgList, err.message);
                    resolve(orgList);
                }
            }
        );
    });
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try{
        let organization = DbService.findOrganizationById(id);
        ctx.body = common.success(organization, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);        
    }
});

router.post("/", async ctx => {
    let orgDto = {
        name: ctx.request.body.name,
        consortiumId: ctx.request.body.consortiumId
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
                domainName: ctx.request.body.domainName
            }
            let parameters = utils.generateCertAuthContainerOptions(containerOptions);
            await DockerClient.getInstance(connectOptions).createContainer(parameters);
        }
        let organization = await DbService.addOrganization(orgDto);
        ctx.body = common.success(organization, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;