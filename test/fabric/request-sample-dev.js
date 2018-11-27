'use strict';

module.exports = {
    "name": "SampleConsortium",
    "type": "fabric",
    "version": "1.3",
    "db": "leveldb",
    "consensus": "kafka",
    "kafka": [
        {
            "name": "kafka1",
            "ip": "39.104.189.169",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        {
            "name": "kafka2",
            "ip": "39.104.152.81",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        {
            "name": "kafka3",
            "ip": "39.104.51.94",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        {
            "name": "kafka4",
            "ip": "39.104.145.229",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        }
    ],
    "zookeeper": [
        {
            "name": "zookeeper1",
            "ip": "39.104.189.169",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        {
            "name": "zookeeper2",
            "ip": "39.104.152.81",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        {
            "name": "zookeeper3",
            "ip": "39.104.51.94",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        }
    ],
    "ordererOrg": {
        "name": "orderer-org",
        "ca": {
            "name": "ca-1",
            "ip": "39.104.189.169",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        "orderer": [{
            "name": "orderer1",
            "ip": "39.104.189.169",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        }]
    },
    "peerOrgs": [{
        "name": "peer-org1",
        "ca": {
            "name": "ca-2",
            "ip": "39.104.145.229",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        },
        "peers": [{
            "name": "peer0",
            "ip": "39.104.189.169",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        }, {
            "name": "peer1",
            "ip": "39.104.145.229",
            "ssh_username": "root",
            "ssh_password": "irisnet-passw0rd-#(U1(*V7MTNU"
        }]
    }],
    "channel": {
        "name": "mychannel",
        "orgs": ["peer-org1"]
    }
};