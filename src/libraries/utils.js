/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

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
        delay: 5000,
        interval: 1000,
        log: true,
        verbose: false,
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

module.exports.generateCAContainerOptions = (options) => {
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

module.exports.generatePeerContainerOptions = (options) => {
    const {image, peerName, domainName, mspId, port, workingDir, enableTls} = options;
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
        '-e', 'CORE_PEER_MSPCONFIGPATH=/data/msp',
        '-e', `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}.${domainName}:${port}`,
        '-e', 'CORE_PEER_GOSSIP_USELEADERELECTION=true',
        '-e', 'CORE_PEER_GOSSIP_ORGLEADER=false',
        '-e', `CORE_PEER_TLS_ENABLED=${enableTls}`,
        '-e', 'CORE_PEER_TLS_CERT_FILE=/data/tls/server.crt',
        '-e', 'CORE_PEER_TLS_KEY_FILE=/data/tls/server.key',
        '-e', 'CORE_PEER_TLS_ROOTCERT_FILE=/data/tls/ca.pem',
        '-e', `CORE_PEER_TLS_CLIENTAUTHREQUIRED=${enableTls}`,
        '-e', 'CORE_PEER_TLS_CLIENTROOTCAS_FILES=/data/tls/ca.pem',
        '-e', 'CORE_LOGGING_LEVEL=debug',
        '-e', 'CORE_VM_ENDPOINT=unix:///var/run/docker.sock',
        '-e', 'CORE_VM_DOCKER_ATTACHSTDOUT=true',
        '-e', `CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${common.DEFAULT_NETWORK.NAME}`,
        '-e', 'GODEBUG=netdns=go',

        image,
        '/bin/bash', '-c', 'peer node start',
    ];
};

module.exports.generateOrdererContainerOptions = (options) => {
    const {image, ordererName, domainName, mspId, port, workingDir, enableTls} = options;
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
        '-e', 'ORDERER_GENERAL_LISTENADDRESS=0.0.0.0',
        '-e', 'ORDERER_GENERAL_GENESISMETHOD=file',
        '-e', 'ORDERER_GENERAL_GENESISFILE=/data/genesis.block',
        '-e', `ORDERER_GENERAL_LOCALMSPID=${mspId}`,
        '-e', 'ORDERER_GENERAL_LOCALMSPDIR=/data/msp',
        '-e', `ORDERER_GENERAL_TLS_ENABLED=${enableTls}`,
        '-e', 'ORDERER_GENERAL_TLS_CERTIFICATE=/data/tls/server.crt',
        '-e', 'ORDERER_GENERAL_TLS_PRIVATEKEY=/data/tls/server.key',
        '-e', 'ORDERER_GENERAL_TLS_ROOTCAS=[/data/msp/tlscacerts/cert.pem]',
        '-e', `ORDERER_GENERAL_TLS_CLIENTAUTHREQUIRED=${enableTls}`,
        '-e', 'ORDERER_GENERAL_TLS_CLIENTROOTCAS=[/data/msp/tlscacerts/cert.pem]',
        '-e', 'ORDERER_DEBUG_BROADCASTTRACEDIR=/data/logs',
        '-e', 'GODEBUG=netdns=go',

        image,
        '/bin/bash', '-c', 'orderer',
    ];
};

module.exports.generateCadvisorContainerOptions = (options) => {
    const {image, cAdvisorName, port} = options;
    return [
        'create',
        '--name', `${cAdvisorName}`,
        '--network', common.DEFAULT_NETWORK.NAME,
        '-p', `${port}:8080`,
        '-v', '/:/rootfs:ro',
        '-v', '/var/run:/var/run:rw',
        '-v', '/sys:/sys:ro',
        '-v', '/var/lib/docker/:/var/lib/docker:ro',
        image,
    ];
};

module.exports.generateConsulContainerOptions = (options) => {
    const {image, consulName, host, consulServer} = options;
    return [
        'create',
        '--name', `${consulName}`,
        '--network', common.DEFAULT_NETWORK.NAME,
        '--net', 'host',
        // '-p', '8400:8400',
        // '-p', '8500:8500',
        // '-p', '8600:53/udp',
        // '-p', '8301:8301/udp',
        // '-p', '8302:8302/udp',
        image,
        'agent', '-client=0.0.0.0', '-data-dir=/tmp/consul', `-join=${consulServer}`, `-advertise=${host}`,
    ];
};

module.exports.generateFileBeatContainerOptions = (options) => {
    const {image, filebeatName, elasticsearchHost} = options;
    return [
        'create',
        '--name', filebeatName,
        '--user', 'root',
        '--network', common.DEFAULT_NETWORK.NAME,
        '--restart', 'always',
        '-v', '/var/lib/docker/containers:/var/lib/docker/containers:ro',
        '-v', '/var/run/docker.sock:/var/run/docker.sock:ro',
        '-e', '-strict.perms=false',
        '-e', `ELASTIC_SEARCH_HOST=${elasticsearchHost}`,
        image,
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
    return process.env.ALL_IN_ONE || false;
};

module.exports.makeHostRecord = (hostName, ipAddress) => {
    return hostName + common.SEPARATOR_COLON + ipAddress;
};

module.exports.getUrl = (location, enableTls) => {
    if (enableTls) {
        return `${common.PROTOCOL.GRPCS}://${location}`;
    } else {
        return `${common.PROTOCOL.GRPC}://${location}`;
    }
};

module.exports.setupChaincodeDeploy = () => {
    if (!process.env.GOPATH) {
        process.env.GOPATH = common.CHAINCODE_GOPATH;
    }
};

module.exports.replacePeerName = (name) => {
    if (name) {
        let pattern = /-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/;
        return name.replace(pattern, '');
    } else {
        return name;
    }
};
