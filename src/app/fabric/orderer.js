'use strict';

const router = require("koa-router")();
const Orderer = require("../../models/orderer");
const common = require("../../libraries/common");

router.get("/orderer", async ctx => {
    Orderer.find({},(err,docs) =>{
        if(err){
            ctx.body = common.error([],err.message);
        }else{
            ctx.body = common.success(docs,common.SUCCESS);
        }            
    });
});

router.get("/orderer/:id", async ctx => {
    let id = ctx.params.id;
    Orderer.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    });
});

module.exports = router;