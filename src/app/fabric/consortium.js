'use strict';

const uuid = require("uuid/v1");
const logger = require("../../libraries/log4js");
const Consortium = require("../../models/consortium");
const common = require("../../libraries/common");

const router = require("koa-router")({prefix: '/consortium'});
router.get("/", async ctx => {
    await Consortium.find({}, (err, docs) => {
        if (err) {
            ctx.body = common.error([], err.message);
        } else {
            ctx.body = common.success(docs, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    });
});

router.get("/:id", async ctx => {
    let id = ctx.params.id;
    logger.debug("the query id is %d", id);
    await Consortium.findById(id, (err, doc) => {
        if (err) {
            ctx.body = common.error({}, err.message);
        } else {
            ctx.body = common.success(doc, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    });
});

router.post("/", async ctx => {
    let name = ctx.request.body.name;
    let consortium = new Consortium();
    consortium.name = name;
    consortium.uuid = uuid();
    consortium.network_config = JSON.stringify(ctx.request.body.config);
    try {
        await consortium.save();
        ctx.body = consortium;
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;
