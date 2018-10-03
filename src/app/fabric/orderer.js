'use strict';

const router = require("koa-router")();
const Orderer = require("../../models/orderer");
const common = require("../../libraries/common");

router.get("/orderer", async ctx => {
    try{
        let orderers = Orderer.find();
        ctx.body = orderers;
    }catch(err){
        ctx.body = common.error([],err.message);
    }
});

router.get("/orderer/:id", async ctx => {
    let id = ctx.params.id;
    try{
        let orderer = await Orderer.findById(id);
        ctx.body = orderer;
    }catch(err){
        ctx.body = common.error({},err.message);
    }
});

module.exports = router;