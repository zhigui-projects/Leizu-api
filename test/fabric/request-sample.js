/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports = {
    'name': 'Test-Chain',
    'type': 'fabric',
    'version': '1.3',
    'db': 'leveldb',
    'consensus': 'solo',
    'kafka': [{
        'name': 'kafka1',
        'ip': '47.254.88.92',
        'ssh_username': 'root',
        'ssh_password': ''
    }],
    'zookeeper': [{
        'name': 'zookeeper1',
        'ip': '47.254.88.92',
        'ssh_username': 'root',
        'ssh_password': ''
    }],
    'ordererOrg': {
        'name': 'orderer-org',
        'ca': {
            'name': 'ca-1',
            'ip': '39.104.189.169',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        'orderer': [{
            'name': 'orderer1',
            'ip': '39.104.189.169',
            'ssh_username': 'root',
            'ssh_password': ''
        }]
    },
    'peerOrgs': [{
        'name': 'peer-org1',
        'ca': {
            'name': 'ca-2',
            'ip': '39.104.152.81',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        'peers': [{
            'name': 'peer0',
            'ip': '39.104.51.94',
            'ssh_username': 'root',
            'ssh_password': ''
        }, {
            'name': 'peer1',
            'ip': '39.104.145.229',
            'ssh_username': 'root',
            'ssh_password': ''
        }]
    }],
    'channel': {
        'name': 'mychannel',
        'orgs': ['peer-org1']
    }
};
