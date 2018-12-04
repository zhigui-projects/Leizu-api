'use strict';

const request = require('supertest');
const app = require('../../../src/index');
const constants = require('../constants');
const token = 'Bearer ' + constants.token;

const chaincode = {
    peers: ['5c04d560b35f8f57014549b1'],
    chaincodeName: 'example_cc',
    chaincodeVersion: 'v0'
};

request(app.callback())
.post('/api/v1/chaincode/install')
.set('Authorization', token)
.send(chaincode)
.end(function (err, response) {
    if (err) console.error(err);
    console.log(response.body);
    app.mongoose.disconnect();
});