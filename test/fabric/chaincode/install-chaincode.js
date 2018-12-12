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
    chaincodeId: constants.chaincodeId,
    peers: ['5c0fc7a89a59d126784d1721', '5c0fc7b29a59d126784d1722', '5c0fc7bb9a59d126784d1723'],
};

request(app.callback())
    .post('/api/v1/chaincode/install')
    .set('Authorization', token)
    .send(chaincode)
    .end(function (err, response) {
        if (err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });