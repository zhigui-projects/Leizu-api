"use strict";

const Docker = require("dockerode");

const connectOptions = require("./options");

var docker = new Docker(connectOptions);
createContainer(docker);

async function createContainer(docker){
    try{
        let parameters = {
            Image: 'hyperledger/fabric-ca',
            Cmd: ['/bin/bash', '-c', 'fabric-ca-server start -b admin:adminpw -d'],
            Env: [
                'GODEBUG=netdns=go',
                'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca-server',
                'FABRIC_CA_SERVER_CA_NAME=rca-org3',
                'FABRIC_CA_SERVER_CSR_HOSTS=rca-org3',
                'FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server/ca-cert.pem',
                'FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server/ca-key.pem',
                'FABRIC_CA_SERVER_TLS_ENABLED=true',
                'FABRIC_CA_SERVER_TLS_CERTFILE=/etc/hyperledger/fabric-ca-server/ca-cert.pem',
                'FABRIC_CA_SERVER_TLS_KEYFILE=/etc/hyperledger/fabric-ca-server/ca-key.pem'
            ],
        };
        let result = await docker.createContainer(parameters);
        console.log(result);
    }catch(err){
        console.error(err);
    }
}