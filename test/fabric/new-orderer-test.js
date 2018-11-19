'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const options = {
    ordererType: 'kafka',
    orderOrg: 'org0',
    orderer: {
        host: 'order1-org0',
        port: 7051
    },
    peerOrgs: [
        {
            name: 'org1',
            anchorPeer: {
                host: 'peer1-org1',
                port: 7050
            },
        }
    ],
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
    organizationId: '5bd162bdb3ac3d3901a4ff42',
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