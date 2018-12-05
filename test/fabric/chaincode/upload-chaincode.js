/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const path = require('path');
const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

request(app.callback())
.post('/api/v1/chaincode/upload')
.set('Content-Type', 'multipart/form-data')
.set('Authorization', token)
.field('chaincodeName', 'example_cc')
.field('chaincodeVersion', 'v0')
.attach('chaincode', path.join(__dirname, 'go/example_cc.go'))
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});

