/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
let token = 'Bearer ' + constants.token;
const consortiumId = '';

function testList() {
    request(app.callback())
        .get('/api/v1/consortium')
        .set('Authorization', token)
        .expect(200)
        .end(function (err, response) {
            if (err) console.error(err);
            console.log(response.body);
            app.mongoose.disconnect();
        });
}

function testDetail() {
    request(app.callback())
        .get('/api/v1/consortium/' + consortiumId)
        .set('Authorization', token)
        .expect(200)
        .end(function (err, response) {
            if (err) console.error(err);
            console.log(response.body);
            app.mongoose.disconnect();
        });
}

testList();
testDetail();
