'use strict';

const router = require("koa-router")();
const Channel = require("../../models/channel");
const common = require("../../libraries/common");

router.get("/channel", async ctx => {
    try{
        let channels = Channel.find();
        ctx.body = channels;
    }catch(err){
        ctx.body = common.error([],err.message);
    }
});

router.get("/channel/:id", async ctx => {
    let id = ctx.params.id;
    try{
        let channel = await Channel.findById(id);
        ctx.body = channel;
    }catch(err){
        ctx.body = common.error({},err.message);
    }
});

module.exports = router;