const router = require("koa-router")();
const logger = require("../../libraries/log4js");
const UserModel = require("../../models/user")

router.post("/fabric/sync",async (ctx) => {
    ctx.response.type = "json";
    ctx.body = {};
});

router.get("/fabric/sync/:id",async (ctx) => {
    logger.info(ctx.params);
    ctx.body = ctx.params;

});

module.exports = router;