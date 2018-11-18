'use strict';

module.exports = {
    "name": "Test-Chain",
    "type": "fabric",
    "version": "1.3",
    "db": "leveldb",
    "consensus": "kafka",
    "kafka": [{
        "name": "kafka1",
        "ip": "47.254.88.92",
        "ssh_username": "root",
        "ssh_password": "Jia@163.com"
    }],
    "zookeeper": [{
        "name": "zookeeper1",
        "ip": "47.254.88.92",
        "ssh_username": "root",
        "ssh_password": "Jia@163.com"
    }],
    "ordererOrg": {
        "name": "orderer-org",
        "ca": {
            "name": "ca-1",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        },
        "orderer": [{
            "name": "orderer1",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        }]
    },
    "peerOrgs": [{
        "name": "peer-org1",
        "ca": {
            "name": "ca-2",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        },
        "peers": [{
            "name": "peer0",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        }, {
            "name": "peer1",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        }]
    }],
    "channel": {
        "name": "mychannel",
        "orgs": ["peer-org1"]
    }
};