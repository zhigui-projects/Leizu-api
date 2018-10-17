'use strict';

const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const common = require('../../libraries/common');

const router = require('koa-router')({prefix: '/organization'});
router.get('/', async ctx => {
    let orgList = [];
    let orgId = [];
    let orgIdx = [];
    await Organization.find({}, (err, docs) => {
        if (err) {
            ctx.body = common.error(orgList, err.message);
        } else {
            for (let i = 0; i < docs.length; i++) {
                orgList.push({
                    id: docs[i]._id,
                    name: docs[i].name,
                    consortium_id: docs[i].consortium_id,
                    peer_count: 0
                });
                orgIdx[docs[i]._id] = i;
                orgId.push(docs[i]._id);
            }
            Peer.aggregate([
                    {$match: {"org_id": {$in: orgId}}},
                    {
                        $group: {
                            _id: "$org_id",
                            total: {$sum: 1}
                        }
                    }
                ]
                , function (err, result) {
                    if (!err) {
                        for (let i = 0; i < result.length; i++) {
                            let idx = orgIdx[result[i]._id];
                            orgList[idx].peer_count = result[i].total;
                        }
                    }
                }
            );
            ctx.body = common.success(orgList, common.SUCCESS);
        }
    }).catch(err => {
        ctx.status = 400;
        ctx.body = common.error(orgList, err.message);
    });
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    await Organization.findById(id, (err, doc) => {
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

module.exports = router;