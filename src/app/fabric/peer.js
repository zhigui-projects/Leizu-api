'use strict';

const router = require("koa-router")();
const Peer = require("../../models/peer");
const common = require("../../libraries/common");

router.get("/peer", async ctx => {
    await Peer.find({},(err,docs) =>{
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

router.get("/peer/:id", async ctx => {
    let id = ctx.params.id;
    await Peer.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    }).catch(err =>{
        ctx.status = 400;
        ctx.body = common.error({},err.message);
    });
});

module.exports = router;