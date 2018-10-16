'use strict';

require('should');
"use strict";

const request = require("supertest");
const app = require("../src/index");

request(app.callback())
    .get('/')
    .expect(200)
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });