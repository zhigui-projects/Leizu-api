'use strict';

const common = require('./common');
const path = require('path');
const fs = require('fs');
const logger = require('log4js').getLogger();

module.exports.wait = async (resources) => {
    logger.info('waiting for resources ready: ', resources);

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

module.exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

module.exports.generateDomainName = (prefixName) => {
    let parts = [];
    parts.push(prefixName);
    parts.push(common.BASE_DOMAIN_NAME);
    return parts.join(common.SEPARATOR_DOT);
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

module.exports.generateContainerNetworkOptions = (options) => {
    options = options || {};
    return [
        'network',
        'create',
        '--driver', options.driver || common.DEFAULT_NETWORK.DRIVER,
        options.name || common.DEFAULT_NETWORK.NAME
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

module.exports.generateOrdererContainerOptions = (options, mode) => {
    switch (mode) {
        case common.MODES.DOCKER:
            return generateOrdererContainerOptionsForDocker(options);
        case common.MODES.SSH:
            return generateOrdererContainerOptionsForSSH(options);
    }
};

const generatePeerContainerOptionsForDocker = ({peerName, domainName, mspId, port, workingDir}) => {
    const portBindings = {};
    portBindings[`${port}/tcp`] = [{HostPort: port}];

    return {
        _query: {name: `${peerName}.${domainName}`},
        Image: 'hyperledger/fabric-ca-peer',
        Hostname: `${peerName}.${domainName}`,
        WorkingDir: workingDir,
        Cmd: ['/bin/bash', '-c', 'peer node start'],
        HostConfig: {
            NetworkMode: common.DEFAULT_NETWORK.NAME,
            PortBindings: portBindings,
            Binds: [
                `${workingDir}:/data`,
                '/var/run:/var/run'
            ],
        },
        Env: [
            `CORE_PEER_ID=${peerName}.${domainName}`,
            `CORE_PEER_ADDRESS=${peerName}.${domainName}:${port}`,
            `CORE_PEER_LOCALMSPID=${mspId}`,
            `CORE_PEER_MSPCONFIGPATH=/data/msp`,
            `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}.${domainName}:${port}`,
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
            'GODEBUG=netdns=go',
        ],
    };
};

const generatePeerContainerOptionsForSSH = ({peerName, domainName, mspId, port, workingDir}) => {
    return [
        'create',
        '--name', `${peerName}.${domainName}`,
        '--hostname', `${peerName}.${domainName}`,
        '--network', common.DEFAULT_NETWORK.NAME,
        '-p', `${port}:7051`,
        '-w', workingDir,
        '-v', `${workingDir}:/data`,
        '-v', '/var/run:/var/run',
        '-e', `CORE_PEER_ID=${peerName}.${domainName}`,
        '-e', `CORE_PEER_ADDRESS=${peerName}.${domainName}:${port}`,
        '-e', `CORE_PEER_LOCALMSPID=${mspId}`,
        '-e', `CORE_PEER_MSPCONFIGPATH=/data/msp`,
        '-e', `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}.${domainName}:${port}`,
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
        '-e', 'GODEBUG=netdns=go',

        'hyperledger/fabric-ca-peer',
        '/bin/bash', '-c', 'peer node start',
    ];
};

const generateOrdererContainerOptionsForDocker = ({ordererName, domainName, mspId, port, workingDir}) => {
    const portBindings = {};
    portBindings[`${port}/tcp`] = [{HostPort: port}];

    return {
        _query: {name: `${ordererName}.${domainName}`},
        Image: 'hyperledger/fabric-ca-orderer',
        Hostname: `${ordererName}.${domainName}`,
        WorkingDir: workingDir,
        Cmd: ['/bin/bash', '-c', 'orderer'],
        HostConfig: {
            NetworkMode: common.DEFAULT_NETWORK.NAME,
            PortBindings: portBindings,
            Binds: [
                `${workingDir}:/data`,
                '/var/run:/var/run'
            ],
        },
        Env: [
            `ORDERER_GENERAL_LISTENADDRESS=0.0.0.0`,
            'ORDERER_GENERAL_GENESISMETHOD=file',
            'ORDERER_GENERAL_GENESISFILE=/data/genesis.block',
            `ORDERER_GENERAL_LOCALMSPID=${mspId}`,
            'ORDERER_GENERAL_LOCALMSPDIR=/data/msp',
            'ORDERER_GENERAL_TLS_ENABLED=true',
            'ORDERER_GENERAL_TLS_CERTIFICATE=/data/tls/server.crt',
            'ORDERER_GENERAL_TLS_PRIVATEKEY=/data/tls/server.key',
            'ORDERER_GENERAL_TLS_ROOTCAS=[/data/tls/ca.pem]',
            'ORDERER_GENERAL_TLS_CLIENTAUTHREQUIRED=true',
            'ORDERER_GENERAL_TLS_CLIENTROOTCAS=[/data/ca.pem]',
            'ORDERER_GENERAL_LOGLEVEL=debug',
            'ORDERER_DEBUG_BROADCASTTRACEDIR=/data/logs',
            'GODEBUG=netdns=go',
        ],
    };
};

const generateOrdererContainerOptionsForSSH = ({ordererName, domainName, mspId, port, workingDir}) => {
    return [
        'create',
        '--name', `${ordererName}.${domainName}`,
        '--hostname', `${ordererName}.${domainName}`,
        '--network', common.DEFAULT_NETWORK.NAME,
        '-p', `${port}:7050`,
        '-w', workingDir,
        '-v', `${workingDir}:/data`,
        '-v', '/var/run:/var/run',
        '-e', 'ORDERER_GENERAL_LOGLEVEL=debug',
        '-e', `ORDERER_GENERAL_LISTENADDRESS=0.0.0.0`,
        '-e', 'ORDERER_GENERAL_GENESISMETHOD=file',
        '-e', 'ORDERER_GENERAL_GENESISFILE=/data/genesis.block',
        '-e', `ORDERER_GENERAL_LOCALMSPID=${mspId}`,
        '-e', 'ORDERER_GENERAL_LOCALMSPDIR=/data/msp',
        '-e', 'ORDERER_GENERAL_TLS_ENABLED=true',
        '-e', 'ORDERER_GENERAL_TLS_CERTIFICATE=/data/tls/server.crt',
        '-e', 'ORDERER_GENERAL_TLS_PRIVATEKEY=/data/tls/server.key',
        '-e', 'ORDERER_GENERAL_TLS_ROOTCAS=[/data/msp/tlscacerts/cert.pem]',
        '-e', 'ORDERER_GENERAL_TLS_CLIENTAUTHREQUIRED=true',
        '-e', 'ORDERER_GENERAL_TLS_CLIENTROOTCAS=[/data/msp/tlscacerts/cert.pem]',
        '-e', 'ORDERER_DEBUG_BROADCASTTRACEDIR=/data/logs',
        '-e', 'GODEBUG=netdns=go',

        'hyperledger/fabric-ca-orderer',
        '/bin/bash', '-c', 'orderer',
    ];
};

module.exports.createDir = (dirpath, mode) => {
    try {
        let pathTmp;
        dirpath.split(/[/\\]/).forEach(async function (dirName) {
            if (!pathTmp && dirName === '') {
                pathTmp = '/';
            }
            pathTmp = path.join(pathTmp, dirName);
            if (!fs.existsSync(pathTmp)) {
                fs.mkdirSync(pathTmp, mode);
            }
        });
    } catch (e) {
        throw e;
    }
};

module.exports.generateRandomHttpPort = () => {
    return exports.generateRandomInteger(1024, 65535);
};

module.exports.generateRandomInteger = (low, high) => {
    return Math.floor(Math.random() * (high - low) + low);
};

module.exports.isSingleMachineTest = () => {
    return true;
};

module.exports.makeHostRecord = (hostName, ipAddress) => {
    return hostName + common.SEPARATOR_COLON + ipAddress;
};

module.exports.getUrl = location => `${common.PROTOCOL.GRPCS}://${location}`;