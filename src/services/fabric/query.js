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

const Client = require("fabric-client");
const Peer = require('fabric-client/lib/Peer.js');
const FabricCAServices = require('fabric-ca-client');

module.exports.getChannels = async function(peerConfig,caConfig){
    let client = new Client();
    client.setAdminSigningIdentity(peerConfig.adminKey, peerConfig.adminCert, peerConfig.mspid);
    let tlsInfo = await module.exports.getClientKeyAndCert(caConfig);

    let options =  {
        pem: peerConfig.pem,
        'clientCert': tlsInfo.certificate,
        'clientKey': tlsInfo.key,
        'ssl-target-name-override': peerConfig['server-hostname']
    };

    let peer = new Peer(peerConfig.url,options);

    return client.queryChannels(peer);
};

module.exports.getClientKeyAndCert = async function(caConfig){
    return new Promise(function (resolve, reject) {
        let fabricCAEndpoint = caConfig.url;
        let tlsOptions = {
            trustedRoots: [],
            verify: false
        };
        let caService = new FabricCAServices(fabricCAEndpoint, tlsOptions, caConfig.name);
        let req = {
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw',
            profile: 'tls'
        };
        caService.enroll(req).then(
            function(enrollment) {
                enrollment.key = enrollment.key.toBytes();
                return resolve(enrollment);
            },
            function(err) {
                return reject(err);
            }
        );
    });
};

module.exports.getChannelConfigFromOrderer = async function(orderConfig,caConfig){
    let client = new Client();
    client.setAdminSigningIdentity(orderConfig.adminKey, orderConfig.adminCert, orderConfig.mspid);
    let tlsInfo = await module.exports.getClientKeyAndCert(caConfig);
    let sysChannel = client.newChannel(orderConfig.sysChannel);

    let options = {
        pem: orderConfig.pem,
        'clientCert': tlsInfo.certificate,
        'clientKey': tlsInfo.key,
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


module.exports.discover = async function(networkConfig,peerConfig){
    let client = Client.loadFromConfig(networkConfig);
    client.setConfigSetting('initialize-with-discovery', true);
    await client.initCredentialStores();
    await module.exports.getTlsCACerts(client);
    let options = {
        pem: peerConfig.pem,
        'ssl-target-name-override': peerConfig['server-hostname'],
        name: peerConfig.name
    };
    let discoveryPeer = client.newPeer(peerConfig.url,options);
    let channel = client.newChannel(peerConfig.channelName);
    let request = {
        'initialize-with-discovery': true,
        'target': discoveryPeer,
    };
    await channel.initialize(request);
    return channel.getDiscoveryResults()
};

module.exports.getTlsCACerts = async function(client){
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
    return;
};