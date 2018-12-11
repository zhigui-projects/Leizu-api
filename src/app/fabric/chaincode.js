/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const fs = require('fs');
const path = require('path');
const Multer = require('koa-multer');
const ChainCode = require('../../models/chaincode');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const ChaincodeService = require('../../services/fabric/chaincode/chaincode');
const chaincodeGoPath = path.join(process.env.GOPATH ? process.env.GOPATH : common.CHAINCODE_GOPATH, 'src');

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

function upload() {
    return Multer({
        storage: Multer.diskStorage({
            // Upload file path setting, uploads folder will be automatically created.
            destination: (req, file, cb) => {
                let filePath = path.join(chaincodeGoPath, common.CHAINCODE_PATH,
                    path.basename(file.originalname, '.go'), Date.now().toString());
                if (fs.existsSync(filePath)) {
                    cb(new Error('The chaincode already exists'));
                } else {
                    utils.createDir(filePath);
                    cb(null, filePath);
                }
            },
            // Rename the uploaded file to get the suffix name
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        // Filter files in illegal formats
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            if (ext !== '.go') {
                cb(new Error('Files in this format are not allowed to be uploaded'));
            } else {
                cb(null, true);
            }
        }
    }).single('chaincode');
}

router.post('/upload', upload(), async ctx => {
        try {
            let params = ctx.req.body;
            let chaincodePath = ctx.req.file.destination.split(chaincodeGoPath + '/')[1];
            if (!chaincodePath) {
                throw new Error('Chaincode upload failed');
            }
            params.chaincodePath = chaincodePath;
            let result = await ChaincodeService.uploadChaincode(params);
            ctx.body = common.success(result, common.SUCCESS);
        } catch (err) {
            ctx.status = 400;
            ctx.body = common.error({}, err.message);
        }
    }
);

router.post('/install', async ctx => {
    let {chaincodeId, peers} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstance(chaincodeId, peers);
        let result = await chaincodeService.installChaincode();
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/deploy', async ctx => {
    let {chaincodeId, channelId, functionName, args} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstance(chaincodeId);
        let result = await chaincodeService.instantiateAndUpgradeChaincode(channelId, functionName, args, 'instantiate');
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/upgrade', async ctx => {
    let {chaincodeId, channelId, functionName, args} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstance(chaincodeId);
        let result = await chaincodeService.instantiateAndUpgradeChaincode(channelId, functionName, args, 'upgrade');
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/invoke', async ctx => {
    let {chaincodeId, channelId, functionName, args} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstance(chaincodeId);
        let result = await chaincodeService.invokeChaincode(channelId, functionName, args);
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/query', async ctx => {
    let {chaincodeId, channelId, functionName, args} = ctx.request.body;
    try {
        let chaincodeService = await ChaincodeService.getInstance(chaincodeId);
        let result = await chaincodeService.queryChaincode(channelId, functionName, args);
        ctx.body = common.success(result, common.SUCCESS);
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

module.exports = router;