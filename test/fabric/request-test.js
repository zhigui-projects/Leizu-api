/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const supertest = require('supertest');
const app = require('../../src/index');
const request = require('./request-sample-centos');

supertest(app.callback())
    .post('/api/v1/request')
    .set('x-request-from', 'BaaS')
    .send(request)
    .end(function(err, response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });