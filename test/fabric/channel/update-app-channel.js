'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const channel = {
    channelId: '5bf593eff468d8a85a20bf12',
    organizationId: '5bf5b11822b302af25737bdf'
};
request(app.callback())
.post('/api/v1/channel/update')
.set('Authorization', token)
.send(channel)
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});