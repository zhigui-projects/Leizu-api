'use strict';

const Channel = require('../../models/channel');
const common = require('../../libraries/common');
const ChannelService = require("../../services/fabric/channel");
const router = require('koa-router')({prefix: '/channel'});

router.get('/', async ctx => {
    await Channel.find({}, (err, docs) => {
        if (err) {
            ctx.body = common.error([], err.message);
        } else {
            ctx.body = common.success(docs, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    });
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    await Channel.findById(id, (err, doc) => {
        if (err) {
            ctx.body = common.error({}, err.message);
        } else {
            ctx.body = common.success(doc, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    });
});

/**
 * fn: add the new channel into fabric network 
 * parameters: genesis block
 * 
 */ 
router.post("/",async ctx =>{
    let parameters = ctx.request.body;
    try{
        let channelService = ChannelService.getInstance();
        await channelService.createChannel(parameters);
        let dto = {};
        let channel = channelService.addChannelIntoDb(dto);
        ctx.body = common.success(channel, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

/**
 * fn: update existing channel's configuration
 * parameters: configuration
 * 
 */ 
router.put("/:id",async ctx =>{
    let id = ctx.params.id;
    let params = ctx.request.body;
    try{
        let channelService = new ChannelService();
        await channelService.updateChannel(id,params);
        ctx.body = common.success({id:id}, common.SUCCESS);
    }catch(err){
       ctx.status = 400;
       ctx.body = common.error({}, err.message); 
    }
});


module.exports = router;