/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

let ConfigTxBuilder = require('../../src/services/fabric/configtxgen');

let config = {
    Consortium: 'SampleConsortium',
    ConsortiumId: '5be951506d8d2a6eecfff5a5',
    Orderer: {
        OrdererType: 'solo',
        Addresses: ['orderer.example.com:7050'],
        Kafka: {Brokers: ['127.0.0.1:9092']}
    },
    Organizations: [{
        Name: 'orderer',
        MspId: 'OrdererMSP',
        Type: 1
    }, {
        Name: 'org1',
        MspId: 'Org1MSP',
        Type: 0,
        AnchorPeers: [{Host: 'peer0.org1.example.com', Port: 7051}],
    }]
};

let builder = new ConfigTxBuilder(config);
console.log(builder.buildConfigtxYaml());
