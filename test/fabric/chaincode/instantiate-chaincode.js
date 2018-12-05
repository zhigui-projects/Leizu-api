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
    chaincodeId: '5c07a2149a086a126b7eb090',
    channelId: '5c0628d95cba28b4e22dc8bf',
    args: ['a', '100', 'b', '200']
};

request(app.callback())
.post('/api/v1/chaincode/deploy')
.set('Authorization', token)
.send(chaincode)
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});