'use strict';

const common = require('../../libraries/common');
const PeerService = require('../../services/fabric/peer');
const DbService = require("../../services/db/dao");
const router = require('koa-router')({prefix: '/peer'});

router.get('/', async ctx => {
    try{
        let peers = await DbService.findPeers();
        ctx.body = common.success(peers, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error([], err.message);        
    }
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try{
        let peer = await DbService.findPeerById(id);
        ctx.body = common.success(peer, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);        
    }
});


/**
 * fn: add the peer into channel by join request
 * parameters: to-be-specified
 * 
 */ 
router.put("/:id",async ctx => {
    let id = ctx.params.id;
    let params = ctx.request.body;
    try{
        let peerService = new PeerService();
        await peerService.joinChannel(id,params);
        ctx.body = common.success({id:id}, common.SUCCESS);
    }catch(err){
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;