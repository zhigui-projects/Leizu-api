'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const channel = {
    channelId: '5bf5942ac4dcb4a8754df6be',
    organizationId: '5bf593d2f468d8a85a20beee'
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