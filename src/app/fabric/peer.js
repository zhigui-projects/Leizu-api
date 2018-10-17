'use strict';

const Peer = require('../../models/peer');
const common = require('../../libraries/common');

const router = require('koa-router')({prefix: '/peer'});
router.get('/', async ctx => {
    await Peer.find({}, (err, docs) => {
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
    await Peer.findById(id, (err, doc) => {
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
 * fn: add the peer into channel by join request
 * 
 */ 
 
router.put("/:id",async ctx => {
    ctx.body = "todo";
});

module.exports = router;