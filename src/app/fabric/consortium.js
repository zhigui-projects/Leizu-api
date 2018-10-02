'use strict';
const router = require("koa-router")();
const uuid = require("uuid/v1");
const logger = require("../../libraries/log4js");
const Consortium = require("../../models/consortium");

router.get("/consortium",async ctx => {
    let consortiums = await Consortium.find();
    ctx.body = consortiums;
});

router.get("/consortium/:id", async ctx => {
    let id = ctx.params.id;
    logger.debug("the query id is %d",id);
    let consortium = await Consortium.findById(id);
    ctx.body = consortium;
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
