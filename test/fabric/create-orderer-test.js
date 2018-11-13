'use strict';

const request = require('supertest');
const app = require('../../src/index');
const constants = require('./constants');
const token = 'Bearer ' + constants.token;
const sshInfo = {
    user: 'root',
    password: 'Inkchain-passw0rd'
};
const options = {
    consortiumId: 'xxxxxxxxxx',
    profile: 'OrgsOrdererGenesis',
    channel: 'OrgsChannel',
    ordererType: 'kafka',
    orderOrg: 'org0',
    orderer: {
        host: 'order1-org0',
        port: 7051
    },
    initOrg: 'org1',
    initOrgAnchorPeer: {
        host: 'peer1-org1',
        port: 7050
    },
    kafka: [
        {
            host: '127.0.2.1',
            port: '9999'
        }
    ]
};
const requestParam = {
    organizationId: '5bd162bdb3ac3d3901a4ff42',
    host: '47.106.121.33',
    port: '2375',
    sshInfo: sshInfo,
    options: options
};


request(app.callback())
    .post('/api/v1/orderer')
    .set('Authorization', token)
    .send(requestParam)
    .end(function (err, response) {
        if (err) console.error(err);
        console.log(response.body);
        app.mongoose.disconnect();
    });