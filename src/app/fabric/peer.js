'use strict';

const router = require("koa-router")();
const Peer = require("../../models/peer");
const common = require("../../libraries/common");

router.get("/peer", async ctx => {
    Peer.find({},(err,docs) =>{
        if(err){
            ctx.body = common.error([],err.message);
        }else{
            ctx.body = common.success(docs,common.SUCCESS);
        }            
    });
});

router.get("/peer/:id", async ctx => {
    let id = ctx.params.id;
    Peer.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    });
});

module.exports = router;