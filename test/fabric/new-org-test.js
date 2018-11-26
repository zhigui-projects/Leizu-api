'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const organization = {
    name: 'org3',
    domainName: 'org3.example.com',
    host: '39.106.149.201',
    username: 'root',
    password: '***REMOVED***',
    port: 22,
    consortiumId: constants.consortiumId,
};

request(app.callback())
    .post('/api/v1/organization')
    .set('Authorization', token)
    .send(organization)
    .end(function(err, response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });