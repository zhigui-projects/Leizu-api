'use strict';

const router = require("koa-router")();
const Orderer = require("../../models/orderer");
const common = require("../../libraries/common");

router.get("/orderer", async ctx => {
    await Orderer.find({},(err,docs) =>{
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

router.get("/orderer/:id", async ctx => {
    let id = ctx.params.id;
    await Orderer.findById(id, (err,doc) => {
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