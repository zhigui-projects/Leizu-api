/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

/**
 * Use fabric sdk to query the blockchain network data
 * channel query: an array of channel;
 * discover query:
 *   - msp map
 *   - orderer map
 *   - peers map
 * channel config query: config block
 *
 */

const fs = require('fs');
const path = require('path');
const Client = require('fabric-client');
const Peer = require('fabric-client/lib/Peer');
const BlockDecoder = require('fabric-client/lib/BlockDecoder');
const FabricCAServices = require('fabric-ca-client');
const DbService = require('../db/dao');
const utils = require('../../libraries/utils');
const env = require('../../env');
const CredentialHelper = require('./tools/credential-helper').CredentialHelper;

module.exports.getBlockChainInfo = async (channelName, peerConfig, caConfig) => {
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);

    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };

    let peer = client.newPeer(peerConfig.url, options);
    let channel = client.newChannel(channelName);
    let result = await channel.queryInfo(peer, true);
    return result;
};

module.exports.getChannelConfig = async (channelName, peerConfig, caConfig) => {
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);

    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };

    let peer = client.newPeer(peerConfig.url, options);
    let channel = client.newChannel(channelName);
    let configEnvelope = await channel.getChannelConfig(peer, true);
    if (configEnvelope) {
        let result = BlockDecoder.HeaderType.decodePayloadBasedOnType(configEnvelope.toBuffer(), 1);
        return result;
    } else {
        return {};
    }
};

module.exports.getBlockByFilter = async (filter, channelName, peerConfig, caConfig) => {
    let condition = filter || {};
    let result = {};
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);

    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };

    let peer = client.newPeer(peerConfig.url, options);
    let channel = client.newChannel(channelName);

    if (condition.queryBlockByHash) {
        result = await channel.queryBlockByHash(condition.blockHash, peer, true);
    } else if (condition.queryBlockByNumber) {
        result = await channel.queryBlockByNumber(condition.blockNumber, peer, true);
    } else if (condition.queryBlockByTxID) {
        result = await channel.queryBlockByTxID(condition.txId, peer, true);
    }
    return result;
};

module.exports.getInstanceChaincodes = async (channelName, peerConfig, caConfig) => {
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);

    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };

    let peer = client.newPeer(peerConfig.url, options);
    let channel = client.newChannel(channelName);
    let result = await channel.queryInstantiatedChaincodes(peer, true);
    return result;
};

module.exports.getChannels = async (peerConfig, caConfig) => {
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);
    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };
    let peer = new Peer(peerConfig.url, options);
    return client.queryChannels(peer, true);
};

module.exports.serviceDiscovery = async (channelName, peerConfig, caConfig) => {
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);

    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };

    let discoveryPeer = client.newPeer(peerConfig.url, options);
    let channel = client.newChannel(channelName);
    let results = await channel._discover({
        target: discoveryPeer,
        config: true
    });

    return results;
};

module.exports.getClientKeyAndCert = async (caConfig) => {
    return new Promise((resolve, reject) => {
        let fabricCAEndpoint = caConfig.url;
        let tlsOptions = {
            trustedRoots: [],
            verify: false
        };
        let caService = new FabricCAServices(fabricCAEndpoint, tlsOptions, caConfig.name);
        let req = {
            enrollmentID: caConfig.enrollId,
            enrollmentSecret: caConfig.enrollSecret,
            profile: 'tls'
        };
        caService.enroll(req).then(
            (enrollment) => {
                enrollment.key = enrollment.key.toBytes();
                return resolve(enrollment);
            },
            (err) => {
                return reject(err);
            }
        );
    });
};

module.exports.getChannelConfigFromOrderer = async (orderConfig, caConfig) => {
    let client = new Client();
    client.setAdminSigningIdentity(orderConfig.adminKey, orderConfig.adminCert, orderConfig.mspid);
    let enrollment = await module.exports.getClientKeyAndCert(caConfig);
    let sysChannel = client.newChannel(orderConfig.sysChannel);
    client.setTlsClientCertAndKey(enrollment.certificate, enrollment.key);
    let options = {
        pem: enrollment.rootCertificate,
        'clientCert': enrollment.certificate,
        'clientKey': enrollment.key,
        'ssl-target-name-override': 'orderer.example.com'
    };
    let orderer = client.newOrderer(
        orderConfig.url,
        options
    );
    sysChannel.addOrderer(orderer);
    let configEnvelope = await sysChannel.getChannelConfigFromOrderer();
    return configEnvelope;
};

module.exports.discover = async (networkConfig, peerConfig) => {
    let client = Client.loadFromConfig(networkConfig);
    client.setConfigSetting('initialize-with-discovery', true);
    await client.initCredentialStores();
    await module.exports.getTlsCACerts(client);
    let options = {
        pem: peerConfig.pem,
        'ssl-target-name-override': peerConfig['server-hostname'],
        name: peerConfig.name
    };
    let discoveryPeer = client.newPeer(peerConfig.url, options);
    let channel = client.newChannel(peerConfig.channelName);
    let request = {
        'initialize-with-discovery': true,
        'target': discoveryPeer,
    };
    await channel.initialize(request);
    return channel.getDiscoveryResults();
};

module.exports.getTlsCACerts = async (client) => {
    const caService = client.getCertificateAuthority();
    const request = {
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw',
        profile: 'tls'
    };
    const enrollment = await caService.enroll(request);
    const key = enrollment.key.toBytes();
    const cert = enrollment.certificate;
    client.setTlsClientCertAndKey(cert, key);
};

module.exports.newOrderer = async (client, orderer) => {
    let org = await DbService.findOrganizationById(orderer.org_id);
    const pem = org.root_cert;
    const clientCert = orderer.tls_cert;
    const clientKey = orderer.tls_key;
    const options = {
        pem: pem,
        clientCert: clientCert,
        clientKey: clientKey,
        'ssl-target-name-override': `${orderer.name}.${org.domain_name}`,
    };
    client.setTlsClientCertAndKey(clientCert, clientKey);
    return client.newOrderer(utils.getUrl(orderer.location, env.network.orderer.tls), options);
};

module.exports.newPeer = async (client, peer, org) => {
    const pem = org.root_cert;
    const clientCert = peer.tls_cert;
    const clientKey = peer.tls_key;
    const options = {
        pem: pem,
        clientCert: clientCert,
        clientKey: clientKey,
        'ssl-target-name-override': `${peer.name}.${org.domain_name}`,
    };
    return client.newPeer(utils.getUrl(peer.location, env.network.peer.tls), options);
};
