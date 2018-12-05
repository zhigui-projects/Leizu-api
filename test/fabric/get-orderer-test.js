/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
let token = 'Bearer ' + constants.token;
let id= '5be94315e7604f9f7653e600';
request(app.callback())
    .get('/api/v1/orderer/'+id)
    .set('Authorization', token)
    .expect(200)
    .end(function (err, response) {
        if (err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });