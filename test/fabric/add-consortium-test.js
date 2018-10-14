'use strict';

const request = require("supertest");
const app = require("../../src/index");

//const consortium = require("./env-sdk");
const consortium = require("./env-dev");

request(app.callback())
    .post("/api/v1/consortium")
    .send(consortium)
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });