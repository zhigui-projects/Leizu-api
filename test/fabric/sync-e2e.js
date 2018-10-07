'use strict';

const request = require("supertest");
const app = require("../../src/index");

request(app.callback())
    .post("/api/v1/fabric/sync/1")
    .send({})
    //.expect(200)
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
    });

