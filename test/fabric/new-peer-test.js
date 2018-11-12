'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const peer = {
    host: "116.85.36.196",
    username: "root",
    password: "1qaz!QAZ",
    port: 22,
    organizationId: "5be3a0dd54e11da19fd8d1aa"
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