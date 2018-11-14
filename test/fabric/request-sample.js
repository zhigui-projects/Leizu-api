'use strict';

module.exports = {
    "name": "Test-Chain",
    "type": "fabric",
    "version": "1.3",
    "db": "leveldb",
    "consensus": "kafka",
    "kafka": [{
        "name": "kafka1",
        "ip": "127.0.0.1",
        "ssh_username": "root",
        "ssh_password": "pass"
    }],
    "zookeeper": [{
        "name": "zookeeper1",
        "ip": "127.0.0.2",
        "ssh_username": "root",
        "ssh_password": "pass"
    }],
    "ordererOrg": {
        "name": "orderer-org",
        "ca": {
            "name": "ca-1",
            "ip": "127.0.0.3",
            "ssh_username": "root",
            "ssh_password": "pass"
        },
        "orderer": [{
            "name": "orderer1",
            "ip": "127.0.0.4",
            "ssh_username": "root",
            "ssh_password": "pass"
        }]
    },
    "peerOrgs": [{
        "name": "peer-org1",
        "ca": {
            "name": "ca-2",
            "ip": "127.0.0.5",
            "ssh_username": "root",
            "ssh_password": "pass"
        },
        "peers": [{
            "name": "peer0",
            "ip": "127.0.0.6",
            "ssh_username": "root",
            "ssh_password": "pass"
        }, {
            "name": "peer1",
            "ip": "127.0.0.7",
            "ssh_username": "root",
            "ssh_password": "pass"
        }]
    }],
    "channel": {
        "name": "mychannel",
        "orgs": ["peer-org1"]
    }
};