'use strict';

const router = require("koa-router")();
const Organization = require("../../models/organization");
const common = require("../../libraries/common");

router.get("/organization", async ctx => {
    Organization.find({},(err,docs) =>{
        if(err){
            ctx.body = common.error([],err.message);
        }else{
            ctx.body = common.success(docs,common.SUCCESS);
        }            
    });
});

router.get("/organization/:id", async ctx => {
    let id = ctx.params.id;
    Organization.findById(id, (err,doc) => {
        if(err){
            ctx.body = common.error({},err.message);
        }else{
            ctx.body = common.success(doc,common.SUCCESS);
        }
    });
});

module.exports = router;