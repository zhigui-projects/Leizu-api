'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;

const peer = {
    organizationId: constants.organizationId,
    peers: [{
        // name: 'peer',
        host: '39.106.149.201',
        port: 22,
        username: 'root',
        password: '***REMOVED***',
    }]
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