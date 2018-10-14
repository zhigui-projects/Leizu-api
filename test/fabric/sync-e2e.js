'use strict';

const request = require("supertest");
const app = require("../../src/index");

var consortiumId = '5bc2a57c05ce040f0559a369';

request(app.callback())
    .post("/api/v1/fabric/sync/" + consortiumId)
    .send({})
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });

