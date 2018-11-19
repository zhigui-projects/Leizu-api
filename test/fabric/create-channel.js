'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;

const channel = {
    organizationId: '5bf26e15d836873ad93ec69d',
    name: 'mychannel'
};

request(app.callback())
.post('/api/v1/channel')
.set('Authorization', token)
.send(channel)
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});