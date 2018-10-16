'use strict';

const ChainCode = require("../../models/smartcontract");
const common = require("../../libraries/common");

const router = require("koa-router")({prefix: '/chaincode'});
router.get("/", async ctx => {
    try {
        let chaincodes = await ChainCode.find();
        ctx.body = common.success(chaincodes, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get("/:id", async ctx => {
    let id = ctx.params.id;
    try {
        let chaincode = ChainCode.findById(id);
        ctx.body = common.success(doc, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;