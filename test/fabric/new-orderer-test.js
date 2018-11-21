'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const options = {
    peerOrgs: [
        {
            name: 'org3',
            anchorPeer: {
                host: 'peer-39-106-149-201.org3.example.com',
                port: 7051
            },
        }
    ],
    ordererType: 'solo',
    kafka: [
        {
            host: '127.0.2.1',
            port: '9999'
        }
    ]
};
const orderer = {
    host: '39.106.149.201',
    port: 22,
    username: 'root',
    password: 'Inkchain-passw0rd',
    organizationId: '5bf3b713a4ca841d34523569',
    options: options
};


request(app.callback())
    .post('/api/v1/orderer')
    .set('Authorization', token)
    .send(orderer)
    .end((err, response) => {
        if (err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });