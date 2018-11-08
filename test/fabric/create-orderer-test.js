'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const sshInfo = {
    user: 'root',
    password: 'Inkchain-passw0rd'
};
const requestParam = {
    organizationId: '5bd162bdb3ac3d3901a4ff42',
    host: '47.106.121.33',
    port: '2375',
    sshInfo: sshInfo
};

request(app.callback())
    .post('/api/v1/orderer')
    .set('Authorization', token)
    .send(requestParam)
    .end(function(err, response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });