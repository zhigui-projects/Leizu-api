/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports = {
    'name': 'Test-Chain-Local',
    'type': 'fabric',
    'version': '1.3',
    'db': 'leveldb',
    'consensus': 'solo',
    'ordererOrg': {
        'name': 'orderer-org',
        'ca': {
            'name': 'orderer-ca',
            'ip': '127.0.0.1'
        },
        'orderer': [{
            'name': 'orderer1',
            'ip': '127.0.0.1'
        }]
    },
    'peerOrgs': [{
        'name': 'peer-org1',
        'ca': {
            'name': 'peer0-ca',
            'ip': '127.0.0.1'
        },
        'peers': [{
            'name': 'peer0',
            'ip': '127.0.0.1'
        }]
    }],
    'channel': {
        'name': 'mychannel',
        'orgs': ['peer-org1']
    }
};
