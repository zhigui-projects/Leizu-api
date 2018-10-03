'use strict';

const router = require("koa-router")();
const Channel = require("../../models/channel");
const common = require("../../libraries/common");

router.get("/channel", async ctx => {
    Channel.find({},(err,docs) =>{
        if(err){
            ctx.body = common.error([],err.message);
        }else{
            ctx.body = common.success(docs,common.SUCCESS);
        }            
    });
});

router.get("/channel/:id", async ctx => {
    let id = ctx.params.id;
    Channel.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    });
});

module.exports = router;