'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
var token = 'Bearer ' + constants.token;
const consortium = require('./create-consortium-config');

request(app.callback())
    .post('/api/v1/consortium/create')
    .set('Authorization', token)
    .send(consortium)
    .end(function(err, response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });