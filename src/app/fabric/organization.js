'use strict';

const router = require("koa-router")();
const Organization = require("../../models/organization");
const common = require("../../libraries/common");

router.get("/organization", async ctx => {
    await Organization.find({},(err,docs) =>{
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

router.get("/organization/:id", async ctx => {
    let id = ctx.params.id;
    await Organization.findById(id, (err,doc) => {
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