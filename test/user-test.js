'use strict';

const request = require('supertest');
const app = require('../src/index');
const user = {
    name: 'admin',
    password: 'pasw0rd'
};
request(app.callback())
    .post('/api/v1/user/login')
    .send(user)
    .end(function(err,response){
        if(err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });