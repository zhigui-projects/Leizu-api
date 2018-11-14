'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
var token = 'Bearer ' + constants.token;
const consortium = require('./request-sample');

request(app.callback())
    .post('/api/v1/request')
    .set('Authorization', token)
    .send(consortium)
    .end(function(err, response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });