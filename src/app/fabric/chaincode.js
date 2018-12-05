/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const ChainCode = require('../../models/chaincode');
const common = require('../../libraries/common');
const ChaincodeService = require('../../services/fabric/chaincode');

const router = require('koa-router')({prefix: '/chaincode'});
router.get('/', async ctx => {
    try {
        let chaincodes = await ChainCode.find();
        ctx.body = common.success(chaincodes, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error([], err.message);
    }
});

router.get('/:id', async ctx => {
    let id = ctx.params.id;
    try {
        let chaincode = ChainCode.findById(id);
        ctx.body = common.success(chaincode, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/install', async ctx => {
    let {peers, chaincodeName, chaincodeVersion} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstance(peers, chaincodeName, chaincodeVersion);
        let result = await chaincodeService.installChaincode();
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/deploy', async ctx => {
    let {chaincodeId, channelName, functionName, args} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstanceById(chaincodeId);
        let result = await chaincodeService.instantiateChaincode(channelName, functionName, args);
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;