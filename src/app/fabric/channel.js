'use strict';

const common = require('../../libraries/common');
const logger = require('../../libraries/log4js');
const ChannelService = require("../../services/fabric/channel");
const DbService = require("../../services/db/dao");
const router = require('koa-router')({prefix: '/channel'});

router.get('/', async ctx => {
    try{
        let channels = await DbService.getChannels();
        ctx.body = common.success(channels, common.SUCCESS);
    }catch(err){
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error([], err.message); 
    }
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try{
        let channel = await DbService.getChannelById(id);
        ctx.body = common.success(channel, common.SUCCESS);
    }catch(err){
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);        
    }
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
        logger.error(err);
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
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message); 
    }
});


module.exports = router;