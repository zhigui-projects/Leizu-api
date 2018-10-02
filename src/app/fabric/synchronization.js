const router = require("koa-router")();
const logger = require("../../libraries/log4js");
const Consortium = require("../../models/consortium");
const syncService = require("../../services/fabric/synchronize");
const common = require("../../libraries/common");

router.post("/fabric/sync/:cid",async ctx => {
    let consortiumId = ctx.params.cid;
    logger.debug("The consortium id is %d",consortiumId);
    try{
        let consortium = Consortium.findById(consortiumId);
        let result = syncService.syncFabric(consortium.network_config);
        ctx.body = common.success(result,"synchronize successfully");
    }catch(err){
        ctx.body = err.message;
    }
});

module.exports = router;