/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const chaincode = {
    chaincodeId: '5c0f80655a037119443af037',
    channelId: '5c0f3100412bcd06fc878d77',
    functionName: 'query',
    args: ['a']
};

request(app.callback())
    .post('/api/v1/chaincode/query')
    .set('Authorization', token)
    .send(chaincode)
    .end(function (err, response) {
        if (err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });