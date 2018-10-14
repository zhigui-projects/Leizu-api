'use strict';

const request = require("supertest");
const app = require("../../src/index");
const constants = require("./constants");
var token = 'bear ' + constants.token;
//const consortium = require("./env-sdk");
const consortium = require("./env-dev");

request(app.callback())
    .post("/api/v1/consortium")
    .set('authorization', token)
    .send(consortium)
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });