/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

module.exports = {
    network: {
        peer: {
            tls: true,
            availableImages: [
                'hyperledger/fabric-ca-peer',
            ]
        },
        orderer: {
            tls: true,
            availableImages: [
                'hyperledger/fabric-ca-orderer',
            ]
        }
    },
    koaLogger: true,
    jwt: {
        secret: '`yGE[RniLYCX6rCni>DKG_(3#si&zvA$WPmgrb2P',
        expiresIn: 36000
    },
    database: {
        url: 'mongodb://127.0.0.1:27017/zigdb',
        debug: false
    },
    ssh: {
        port: 22
    },
    prometheus: {
        url: 'http://127.0.0.1:9090'
    },
    configtxlator: {
        url: 'http://127.0.0.1:7059',
    },
    cryptoConfig: {
        name: 'configtx.yaml',
        path: '/tmp/crypto-config'
    }
};
