/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports = {
    'name': 'SampleConsortium',
    'type': 'fabric',
    'version': '1.3',
    'db': 'leveldb',
    'consensus': 'kafka',
    'kafka': [
        {
            'name': 'kafka1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        {
            'name': 'kafka2',
            'ip': '39.104.122.83',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        {
            'name': 'kafka3',
            'ip': '39.104.134.22',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        {
            'name': 'kafka4',
            'ip': '39.104.170.33',
            'ssh_username': 'root',
            'ssh_password': ''
        }
    ],
    'zookeeper': [
        {
            'name': 'zookeeper1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        {
            'name': 'zookeeper2',
            'ip': '39.104.122.83',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        {
            'name': 'zookeeper3',
            'ip': '39.104.134.22',
            'ssh_username': 'root',
            'ssh_password': ''
        }
    ],
    'ordererOrg': {
        'name': 'orderer-org',
        'ca': {
            'name': 'ca-1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': ''
        },
        'orderer': [{
            'name': 'orderer1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': ''
        }]
    },
    'peerOrgs': [
        {
            'name': 'peer-org1',
            'ca': {
                'name': 'ca-2',
                'ip': '39.104.170.33',
                'ssh_username': 'root',
                'ssh_password': ''
            },
            'peers': [{
                'name': 'peer0',
                'ip': '39.104.132.206',
                'ssh_username': 'root',
                'ssh_password': ''
            }, {
                'name': 'peer1',
                'ip': '39.104.170.33',
                'ssh_username': 'root',
                'ssh_password': ''
            }]
        },
        {
            'name': 'peer-org2',
            'ca': {
                'name': 'ca-3',
                'ip': '39.104.134.22',
                'ssh_username': 'root',
                'ssh_password': ''
            },
            'peers': [{
                'name': 'peer0',
                'ip': '39.104.134.22',
                'ssh_username': 'root',
                'ssh_password': ''
            }, {
                'name': 'peer1',
                'ip': '39.104.122.83',
                'ssh_username': 'root',
                'ssh_password': ''
            }]
        }
    ],
    'channel': {
        'name': 'mychannel',
        'orgs': ['peer-org1', 'peer-org2']
    }
};
