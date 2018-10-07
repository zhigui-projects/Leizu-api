'use strict';

const router = require("koa-router")();
const Channel = require("../../models/channel");
const common = require("../../libraries/common");

router.get("/channel", async ctx => {
    await Channel.find({},(err,docs) =>{
        if(err){
            ctx.body = common.error([],err.message);
        }else{
            ctx.body = common.success(docs,common.SUCCESS);
        }            
    }).catch(err =>{
        ctx.status = 400;
        ctx.body = common.error([],err.message);
    });
});

router.get("/channel/:id", async ctx => {
    let id = ctx.params.id;
    await Channel.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    }).catch(err =>{
        ctx.status = 400;
        ctx.body = common.error({},err.message);
    });;
});

module.exports = router;