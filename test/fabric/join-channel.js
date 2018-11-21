'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;

const channel = {
    channelId: '5bf58d8314f85ea4a612223e',
    organizationId: '5bf5878ff8b47aa29bc13fd2'
};

request(app.callback())
.post('/api/v1/channel/join')
.set('Authorization', token)
.send(channel)
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});