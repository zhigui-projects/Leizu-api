'use strict';

module.exports = {
    serviceName: 'my-consortium',
    version: 'fabric 1.2',
    serviceType: 0,
    ledgerDB: 'goleveldb',
    consensusType: 'kafka',
    kafka: [{
        name: 'kafka1',
        ip: '127.0.0.1',
        sshUser: 'admin',
        password: 'adminpw'
    }],
    zookeeper: [{
        name: 'zookeeper1',
        ip: '127.0.0.1',
        sshUser: 'admin',
        password: 'adminpw'
    }],
    organizations: [{
        name: 'org0',
        type: 0, // 0-orderer, 1-peer
        ca: [{
            name: 'ca1-org0',
            ip: '127.0.0.1',
            sshUser: 'admin',
            password: 'adminpw'
        }],
        peer: [{
            name: 'peer1-org0',
            ip: '127.0.0.1',
            sshUser: 'admin',
            password: 'adminpw'
        }]
    }, {
        name: 'org1',
        type: 1, // 0-orderer, 1-peer
        ca: [{
            name: 'ca2-org1',
            ip: '127.0.0.1',
            sshUser: 'admin',
            password: 'adminpw'
        }],
        peer: [{
            name: 'peer1-org1',
            ip: '127.0.0.1',
            sshUser: 'admin',
            password: 'adminpw'
        }]
    }],
    channel: {
        name: 'mychannel',
        orgs: ['org0', 'org1']
    }
};