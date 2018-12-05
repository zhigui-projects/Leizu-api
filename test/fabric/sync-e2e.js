/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');

const consortiumId = '5bc2a57c05ce040f0559a369';
const token = 'Bearer ' + constants.token;

request(app.callback())
    .post('/api/v1/fabric/sync/' + consortiumId)
    .set('Authorization', token)
    .send({})
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });

