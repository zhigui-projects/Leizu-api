'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
var token = 'Bearer ' + constants.token;
const organization = {
    name: "new-org",
    domainName: "new-org.example.com",
    host: "47.254.71.145",
    username: "root",
    password: "***REMOVED***",
    port: 22,
    consortiutmId: "5bc2a57c05ce040f0559a369"
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