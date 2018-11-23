'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const channel = {
    organizationId: '5bf61facfd3da04705a04a1c',
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