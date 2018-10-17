'use strict';

const Channel = require('../../models/channel');
const common = require('../../libraries/common');

const router = require('koa-router')({prefix: '/channel'});
router.get('/', async ctx => {
    await Channel.find({}, (err, docs) => {
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

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    await Channel.findById(id, (err, doc) => {
        if (err) {
            ctx.body = common.error({}, err.message);
        } else {
            ctx.body = common.success(doc, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    });
});

/**
 * fn: add the new channel into fabric network 
 *
 */ 

router.post("/new",async ctx =>{
    ctx.body = "todo";
});

/**
 * fn: update existing channel's configuration
 * 
 */ 

router.put("/:id",async ctx =>{
    ctx.body = "todo"
});


module.exports = router;