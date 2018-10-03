'use strict';

const router = require("koa-router")();
const uuid = require("uuid/v1");
const logger = require("../../libraries/log4js");
const Consortium = require("../../models/consortium");
const common = require("../../libraries/common");

router.get("/consortium",async ctx => {
    Consortium.find({},(err,docs) =>{
        if(err){
            ctx.body = common.error([],err.message);
        }else{
            ctx.body = common.success(docs,common.SUCCESS);
        }            
    });
});

router.get("/consortium/:id", async ctx => {
    let id = ctx.params.id;
    logger.debug("the query id is %d",id);
    Consortium.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    });
});

router.post("/consortium",async ctx => {
    let name = ctx.body.name;
    let consortium = new Consortium();
    consortium.name = name;
    consortium.uuid = uuid();
    consortium.network_config = JSON.stringify(ctx.body.config);
    consortium.save(function(err,doc){
        if(err){
            ctx.body = err;
        }else{
            ctx.body = doc;
        }
    });
});

module.exports = router;
