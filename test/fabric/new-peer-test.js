'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const peer = {
    host: "39.106.149.201",
    username: "root",
    password: "***REMOVED***",
    port: 22,
    organizationId: "5bea5fb926681297cccedd0f"
};

request(app.callback())
    .post('/api/v1/peer')
    .set('Authorization', token)
    .send(peer)
    .end((err, response) => {
        if (err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });