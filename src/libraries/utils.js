'use strict';

module.exports.wait = async (resources) => {
    const waitOn = require('wait-on');

    let options = {
        resources: [].concat(resources),
        timeout: 30000,
    };

    try {
        await waitOn(options);
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

module.exports.extend = (target, source) => {
    if (source === null || typeof source !== 'object') return target;

    const keys = Object.keys(source);
    let i = keys.length;
    while (i--) {
        target[keys[i]] = source[keys[i]];
    }
    return target;
};

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


module.exports.generateCertAuthContainerCreateOptions = (options) => {
    return [
        'create',
        '--name', 'ca-' + options.name,
        '-e', 'FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca-server',
        '-e', 'FABRIC_CA_SERVER_CA_NAME=ca-' + options.name,
        '-p', options.port + ':7054',
        'hyperledger/fabric-ca',
        '/bin/bash', '-c',
        'fabric-ca-server start -d -b admin:adminpw'
    ];
};

module.exports.generatePeerContainerOptions = (options) => {
    const {peerName, mspid, workingDir} = options;

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

module.exports.generatePeerContainerCreateOptions = (options) => {
    const {peerName, mspid, port, workingDir} = options;

    return [
        'create',
        '--name', `peer-${peerName}`,
        '--hostname', peerName,
        '-p', `${port}:${port}`,
        '-w', workingDir,
        '-v', `${workingDir}/data:/data`,
        '-v', '/var/run:/var/run',
        '-e', `CORE_PEER_ID=${peerName}`,
        '-e', `CORE_PEER_ADDRESS=${peerName}:${port}`,
        '-e', `CORE_PEER_LOCALMSPID=${mspid}`,
        '-e', `CORE_PEER_MSPCONFIGPATH=/data/msp`,
        '-e', `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}:${port}`,
        '-e', 'CORE_PEER_GOSSIP_USELEADERELECTION=true',
        '-e', 'CORE_PEER_GOSSIP_ORGLEADER=false',
        '-e', 'CORE_PEER_TLS_ENABLED=true',
        '-e', `CORE_PEER_TLS_CERT_FILE=/data/tls/server.crt`,
        '-e', `CORE_PEER_TLS_KEY_FILE=/data/tls/server.key`,
        '-e', 'CORE_PEER_TLS_ROOTCERT_FILE=/data/tls/ca.pem',
        '-e', 'CORE_PEER_TLS_CLIENTAUTHREQUIRED=true',
        '-e', 'CORE_PEER_TLS_CLIENTROOTCAS_FILES=/data/tls/ca.pem',
        '-e', 'CORE_LOGGING_LEVEL=debug',
        '-e', 'CORE_VM_ENDPOINT=unix:///var/run/docker.sock',
        '-e', 'CORE_VM_DOCKER_ATTACHSTDOUT=true',

        'hyperledger/fabric-ca-peer',
        '/bin/bash', '-c', 'peer node start',
    ];
};
