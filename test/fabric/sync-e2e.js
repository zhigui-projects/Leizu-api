'use strict';

const request = require("supertest");
const app = require("../../src/index");

var consortiumId = '5bbbee8f688a5d09ba13299c';
request(app.callback())
    .post("/api/v1/fabric/sync/" + consortiumId)
    .send({})
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });

