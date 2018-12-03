'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const channel = {
    organizationIds: [constants.organizationId],
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
