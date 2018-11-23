'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const syschannel = {
    channelType: 1,
    organizationId: '5bf59d30e41182aabdb4793e'
};
request(app.callback())
.post('/api/v1/channel/update')
.set('Authorization', token)
.send(syschannel)
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});