'use strict';

const router = require("koa-router")();
const Organization = require("../../models/organization");
const common = require("../../libraries/common");

router.get("/organization", async ctx => {
    try{
        let organizations = Organization.find();
        ctx.body = organizations;
    }catch(err){
        ctx.body = common.error([],err.message);
    }
});

router.get("/organization/:id", async ctx => {
    let id = ctx.params.id;
    try{
        let organization = await Organization.findById(id);
        ctx.body = organization;
    }catch(err){
        ctx.body = common.error({},err.message);
    }
});

module.exports = router;