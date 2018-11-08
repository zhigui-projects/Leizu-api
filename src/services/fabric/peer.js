"use strict";

const ChannelService = require('./join-channel');
const CredentialHelper = require('./credential-helper');
const DockerClient = require('../docker/client');
const common = require('../../libraries/common');

module.exports = class PeerService {

    static async joinChannel(channelName, params) {
        ChannelService.joinChannel(channelName, params);
    }

    static async preContainerStart(options) {
        const {org, connectionOptions} = options;
        const certs = {
            adminKey: org.admin_key,
            adminCert: org.admin_cert,
            rootCert: org.root_cert
        };
        const certPath = await CredentialHelper.storeCredentials(org.msp_id, certs);
        const remotePath = `${common.PEER_HOME}/${org.msp_id}.zip`;
        await DockerClient.getInstance(connectionOptions).transferFile({
            local: certPath,
            remote: remotePath
        });
        const bash = DockerClient.getInstance(Object.assign({}, connectionOptions, {cmd: 'bash'}));

        await bash.exec(['-c', `unzip -o ${remotePath} -d ${common.PEER_HOME}/data/msp`]);
        await bash.exec(['-c', `mkdir -p ${common.PEER_HOME}/data/tls`]);
        await bash.exec(['-c', `cp ${common.PEER_HOME}/data/msp/signcerts/* ${common.PEER_HOME}/data/tls/server.crt`]);
        await bash.exec(['-c', `cp ${common.PEER_HOME}/data/msp/keystore/* ${common.PEER_HOME}/data/tls/server.key`]);
        await bash.exec(['-c', `cp ${common.PEER_HOME}/data/msp/cacerts/* ${common.PEER_HOME}/data/tls/ca.pem`]);
    }
};
