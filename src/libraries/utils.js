'use strict';

const common = require('./common');

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
        '-e', 'FABRIC_CA_SERVER_CSR_HOSTS=ca-' + options.domainName,
        '-p', options.port + ':7054',
        'hyperledger/fabric-ca',
        '/bin/bash', '-c',
        'fabric-ca-server start -d -b admin:adminpw'
    ];
};

module.exports.generatePeerContainerOptions = (options, mode) => {
    switch (mode) {
        case common.MODES.DOCKER:
            return generatePeerContainerOptionsForDocker(options);
        case common.MODES.SSH:
            return generatePeerContainerOptionsForSSH(options);
    }
};

const generatePeerContainerOptionsForDocker = ({port, peerName, workingDir, mspid}) => {
    const portBindings = {};
    portBindings[`${port}/tcp`] = [{HostPort: port}];

    return {
        _query: {name: peerName},
        Image: 'hyperledger/fabric-ca-peer',
        Hostname: peerName,
        WorkingDir: workingDir,
        Cmd: ['/bin/bash', '-c', 'peer node start'],
        HostConfig: {
            PortBindings: portBindings,
            Binds: [
                `${workingDir}/data:/data`,
                '/var/run:/host/var/run'
            ],
        },
        Env: [
            `CORE_PEER_ID=${peerName}`,
            `CORE_PEER_ADDRESS=${peerName}:${port}`,
            `CORE_PEER_LOCALMSPID=${mspid}`,
            `CORE_PEER_MSPCONFIGPATH=/data/msp`,
            `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}:${port}`,
            'CORE_PEER_GOSSIP_USELEADERELECTION=true',
            'CORE_PEER_GOSSIP_ORGLEADER=false',
            'CORE_PEER_TLS_ENABLED=true',
            `CORE_PEER_TLS_CERT_FILE=/data/tls/server.crt`,
            `CORE_PEER_TLS_KEY_FILE=/data/tls/server.key`,
            'CORE_PEER_TLS_ROOTCERT_FILE=/data/tls/ca.pem',
            'CORE_PEER_TLS_CLIENTAUTHREQUIRED=true',
            'CORE_PEER_TLS_CLIENTROOTCAS_FILES=/data/ca.pem',
            'CORE_LOGGING_LEVEL=debug',
            'CORE_VM_ENDPOINT=unix:///var/run/docker.sock',
            'CORE_VM_DOCKER_ATTACHSTDOUT=true',
        ],
    }
};

const generatePeerContainerOptionsForSSH = ({peerName, mspid, port, workingDir}) => {
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
