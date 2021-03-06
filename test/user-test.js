/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const request = require('supertest');
const app = require('../src/index');
const user = {
    username: 'admin',
    password: 'passw0rd'
};
request(app.callback())
    .post('/api/v1/user/login')
    .send(user)
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });
