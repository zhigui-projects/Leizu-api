'use strict';

const Action = require('./action');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const DaoService = require('../db/dao');
const JoinChannelService = require('../fabric/join-channel');

module.exports = class PeerJoinAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let channelName = params.channelName;
        let peerId = params._id;
        let networkConfig = await this.produceConfiguration(peerId);
        networkConfig.orderConfig = params.params;
        return await JoinChannelService.joinChannel(channelName,networkConfig);
    }

    async produceConfiguration(peerId){
        let configuration = {};
        let peer = await DaoService.findPeerById(peerId);
        let peerObject = peer.toObject();
        let organization = await DaoService.findOrganizationById(peerObject.org_id);
        let orgObject = organization.toObject();
        let certAuth = await DaoService.findCertAuthorityByOrg(orgObject._id);
        let certAuthObject = certAuth.toObject();
        configuration = {
            caConfig: {
                url: certAuthObject.url,
                name: certAuthObject.name,
                enrollId: common.BOOTSTRAPUSER.enrollmentID,
                enrollSecret: common.BOOTSTRAPUSER.enrollmentSecret
            },
            newConfig: {
                mspid: orgObject.msp_id,
                url: peerObject.location,
                pem: orgObject.root_cert,
                adminKey: orgObject.admin_key,
                adminCert: orgObject.admin_cert,
                tlsKey: peerObject.tls_key,
                tlsCert: peerObject.tls_cert
            }
        };
        return configuration;
    }

};