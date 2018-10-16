"use strict";

const Docker = require("dockerode");

const connectOptions = require("./options");

var docker = new Docker(connectOptions);
createContainer(docker);

async function createContainer(docker){
    try{
        let parameters = {
            Image: 'hyperledger/fabric-ca',
            Cmd: ['/bin/bash', '-c', 'scripts/start-root-ca.sh 2>&1'],
            Env: [
                'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca',
                'GODEBUG=netdns=go',
                'FABRIC_CA_SERVER_CA_NAME=rca-org3',
                'FABRIC_CA_SERVER_CSR_HOSTS=rca-org3',
                'BOOTSTRAP_USER_PASS=rca-org3-admin:rca-org3-adminpw',
                'START_PORT=7062'
            ],
        };
        let result = await docker.createContainer(parameters);
        console.log(result);
    }catch(err){
        console.error(err);
    }
}