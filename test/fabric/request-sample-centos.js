'use strict';

module.exports = {
    'name': 'SampleConsortium',
    'type': 'fabric',
    'version': '1.3',
    'db': 'leveldb',
    'consensus': 'kafka',
//    'consensus': 'solo',
    'kafka': [
        {
            'name': 'kafka1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        {
            'name': 'kafka2',
            'ip': '39.104.122.83',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        {
            'name': 'kafka3',
            'ip': '39.104.134.22',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        {
            'name': 'kafka4',
            'ip': '39.104.170.33',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        }
    ],
    'zookeeper': [
        {
            'name': 'zookeeper1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        {
            'name': 'zookeeper2',
            'ip': '39.104.122.83',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        {
            'name': 'zookeeper3',
            'ip': '39.104.134.22',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        }
    ],
    'ordererOrg': {
        'name': 'orderer-org',
        'ca': {
            'name': 'ca-1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        'orderer': [{
            'name': 'orderer1',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        }]
    },
    'peerOrgs': [{
        'name': 'peer-org1',
        'ca': {
            'name': 'ca-2',
            'ip': '39.104.170.33',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        },
        'peers': [{
            'name': 'peer0',
            'ip': '39.104.132.206',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        }, {
            'name': 'peer1',
            'ip': '39.104.170.33',
            'ssh_username': 'root',
            'ssh_password': 'FaVm&zu2mxFtkGwK'
        }]
    }],
    'channel': {
        'name': 'mychannel',
        'orgs': ['peer-org1']
    }
};