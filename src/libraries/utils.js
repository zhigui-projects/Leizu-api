'use strict';

module.exports.asyncForEach = async (array, callback) => {
    let results = [];
    for (let index = 0; index < array.length; index++) {
        let result = await callback(array[index], index, array);
        results.push(result);
    }
    return results;
};


module.exports.generateCertAuthContainerOptions = function(options){
    let parameters = {
        Image: 'hyperledger/fabric-ca',
        Cmd: ['/bin/bash', '-c', 'fabric-ca-server start -b admin:adminpw -d'],
        Env: [
            'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca-server',
            'FABRIC_CA_SERVER_CA_NAME=ca-' + options.name,
            'FABRIC_CA_SERVER_CSR_HOSTS=ca-' + options.domainName
        ],
    };
    return parameters;
};

module.exports.generatePeerContainerOptions = function(options){
    let parameters = {
        Image: 'hyperledger/fabric-peer',
        Cmd: ['/bin/bash', '-c', 'peer node start'],
        Env: [
            'CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock',
            'CORE_PEER_ID=' + options.peerId,
            'CORE_PEER_ADDRESS=' + options.endpoint,
            'CORE_PEER_LISTENADDRESS=' + options.endpoint,
            'CORE_PEER_GOSSIP_ENDPOINT=' + options.endpoint,
            'CORE_PEER_GOSSIP_EXTERNALENDPOINT=' + options.endpoint,
            'CORE_PEER_EVENTS_ADDRESS=0.0.0.0:7053',
            'CORE_LOGGING_LEVEL=debug',
            'CORE_VM_DOCKER_ATTACHSTDOUT=true',
            'CORE_PEER_LOCALMSPID=' + options.mspid,
            'CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/'
        ],
        name: options.name
    };
    return parameters;    
}