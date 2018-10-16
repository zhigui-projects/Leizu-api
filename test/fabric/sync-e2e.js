'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');

var consortiumId = '5bc2a57c05ce040f0559a369';
var token = 'Bearer ' + constants.token;

request(app.callback())
    .post('/api/v1/fabric/sync/' + consortiumId)
    .set('Authorization', token)
    .send({})
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });

