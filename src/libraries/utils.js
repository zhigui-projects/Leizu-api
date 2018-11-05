'use strict';

module.exports.asyncForEach = async (array, callback) => {
    let results = [];
    for (let index = 0; index < array.length; index++) {
        let result = await callback(array[index], index, array);
        results.push(result);
    }
    return results;
};


module.exports.generateCertAuthContainerOptions = (options) => {
    return {
        Image: 'hyperledger/fabric-ca',
        Cmd: ['/bin/bash', '-c', 'fabric-ca-server start -b admin:adminpw -d'],
        Env: [
            'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca-server',
            'FABRIC_CA_SERVER_CA_NAME=ca-' + options.name,
            'FABRIC_CA_SERVER_CSR_HOSTS=ca-' + options.domainName
        ],
    };
};

module.exports.generatePeerContainerOptions = (options) => {
    const workingDir = '/opt/gopath/src/github.com/hyperledger/fabric/peer';
    const {peerName, mspid} = options;

    return {
        _query: {name: peerName},
        Image: 'hyperledger/fabric-ca-peer', //TODO: replace the image
        Hostname: peerName,
        WorkingDir: workingDir,
        Cmd: ['/bin/bash', '-c', '/scripts/start-peer-standalone.sh'], //TODO: put the script into the image
        HostConfig: {
            NetworkMode: 'host',
            Binds: [
                `${workingDir}/scripts:/scripts`,
                `${workingDir}/data:/data`,
                '/var/run:/host/var/run'
            ],
        },
        Env: [
            `CORE_PEER_ID=${peerName}`,
            `CORE_PEER_ADDRESS=${peerName}:7051`,
            `CORE_PEER_LOCALMSPID=${mspid}`,
            `CORE_PEER_MSPCONFIGPATH=${workingDir}/msp`,
            `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}:7051`,
            'CORE_PEER_GOSSIP_USELEADERELECTION=true',
            'CORE_PEER_GOSSIP_ORGLEADER=false',
            'CORE_PEER_GOSSIP_SKIPHANDSHAKE=true',
            'CORE_LOGGING_LEVEL=debug',
            'CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock',
            'CORE_VM_DOCKER_ATTACHSTDOUT=true',
            'CORE_PEER_TLS_ENABLED=true',
            `CORE_PEER_TLS_CERT_FILE=${workingDir}/tls/server.crt`,
            `CORE_PEER_TLS_KEY_FILE=${workingDir}/tls/server.key`,
            'CORE_PEER_TLS_ROOTCERT_FILE=/data/org1-ca-chain.pem', //TODO: scp the CA file
            'CORE_PEER_TLS_CLIENTAUTHREQUIRED=true',
            'CORE_PEER_TLS_CLIENTROOTCAS_FILES=/data/org1-ca-chain.pem', //TODO: generate it automatically
            'CORE_PEER_TLS_CLIENTCERT_FILE=/data/tls/peer3-org1-client.crt', //TODO: generate it automatically
            'CORE_PEER_TLS_CLIENTKEY_FILE=/data/tls/peer3-org1-client.key', //TODO: generate it automatically

            'GODEBUG=netdns=go',
            `FABRIC_CA_CLIENT_HOME=${workingDir}`,
            'FABRIC_CA_CLIENT_TLS_CERTFILES=/data/org1-ca-chain.pem', //TODO: generate it automatically
            `ENROLLMENT_URL=https://${peerName}:${peerName}pw@ica-org1:7057`, //TODO: replace the CA url
            'CA_ADMIN_ENROLLMENT_URL=https://ica-org1-admin:ica-org1-adminpw@ica-org1:7057', //TODO: generate it automatically
            `PEER_NAME=${peerName}`,
            `PEER_HOME=${workingDir}`,
            `PEER_HOST=${peerName}`,
            'ORG_ADMIN_CERT=/data/orgs/org1/msp/admincerts/cert.pem', //TODO: replace org1
            'ORG_ADMIN_HOME=/data/orgs/org1/admin', //TODO: replace org1
        ],
    };
};
