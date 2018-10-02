'use strict';

const router = require("koa-router")();
const Peer = require("../../models/peer");
const common = require("../../libraries/common");

router.get("/peer", async ctx => {
    try{
        let peers = Peer.find();
        ctx.body = peers;
    }catch(err){
        ctx.body = common.error([],err.message);
    }
});

router.get("/peer/:id", async ctx => {
    let id = ctx.params.id;
    try{
        let peer = await Peer.findById(id);
        ctx.body = peer;
    }catch(err){
        ctx.body = common.error({},err.message);
    }
});

module.exports = router;