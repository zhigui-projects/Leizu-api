'use strict';

const Action = require('./action');

const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Consortium = require('../../models/consortium');
const CertAuthority = require('../../models/certauthority');
const common = require('../../libraries/common');

module.exports = class ConsortiumUpdateAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let consortium = await this.getConsortium();
        if(consortium) {
            let configuration = {};
            let consortiumId = consortium._id;
            //build network configuration
            configuration.name = consortium.name;
            configuration.sysChannel = common.SYSTEM_CHANNEL;
            configuration.orgs = [];
            let orderConfiguration =  await this.findOrderConfiguration(consortiumId);
            configuration.orgs.push(orderConfiguration);
            let peerConfiguration = await this.findPeerConfiguration(consortiumId,configuration);
            configuration.orgs.push(peerConfiguration);
            await this.updateConsortiumConfiguration(consortiumId,configuration);
        }
    }

    async findPeerConfiguration(consortiumId,configuration){
        let peerConfiguration = {};
        let filter = {
            consortium_id: consortiumId,
            type: Common.PEER_TYPE_PEER
        };
        let peer = await Peer.findOne(filter);
        if(peer){
            let orgId = peer.org_id;
            let organization = await Organization.findById(orgId);
            if(organization){
                peerConfiguration.name = organization.name;
                peerConfiguration.mspId = organization.msp_id;
                peerConfiguration.signIdentity = {
                    adminKey: organization.admin_key,
                    adminCert: organization.admin_cert
                };
                let caId = organization.ca_id;
                let certAuthority = await CertAuthority.findById(caId);
                if(certAuthority){
                    peerConfiguration.ca = {
                        name: certAuthority.name,
                        url: certAuthority.url,
                        enrollId: certAuthority.enroll_id,
                        enrollSecret: certAuthority.enroll_secret
                    };
                }
                peerConfiguration.peers = [];
                let hostname = `${peer.name}.${organization.domain_name}`;
                configuration.discoverPeer = hostname;
                peerConfiguration.peers.push({
                    url: peer.location,
                    'server-hostname': hostname
                });
            }
        }
        return peerConfiguration;
    }

    async findOrderConfiguration(consortiumId) {
        let orderConfiguration = {};
        let filter = {
            consortium_id: consortiumId,
            type: Common.PEER_TYPE_ORDER
        };
        let orderPeer = await Peer.findOne(filter);
        if(orderPeer){
            let orgId = orderPeer.org_id;
            let organization = await Organization.findById(orgId);
            if(organization){
                orderConfiguration.name = organization.name;
                orderConfiguration.mspId = organization.msp_id;
                orderConfiguration.signIdentity = {
                    adminKey: organization.admin_key
                };
                let caId = organization.ca_id;
                let certAuthority = await CertAuthority.findById(caId);
                if(certAuthority){
                    orderConfiguration.ca = {
                        name: certAuthority.name,
                        url: certAuthority.url,
                        enrollId: certAuthority.enroll_id,
                        enrollSecret: certAuthority.enroll_secret
                    };
                }
                orderConfiguration.peers = [];
                orderConfiguration.peers.push({
                    url: orderPeer.location,
                    'server-hostname': `${orderPeer.name}.${organization.domain_name}`
                });
            }
        }
        return orderConfiguration;
    }

    async updateConsortiumConfiguration(consortiumId,configuration){
        await Consortium.findByIdAndUpdate(consortiumId, {network_config: JSON.stringify(configuration)});
    }

    async getConsortium(){
        let condition = {request_id: this.getRequestId()};
        let consortium = await Consortium.findOne(condition);
        return consortium;
    }

    getRequestId(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        return params[this.registry.CONTEXT.REQUEST_ID];
    }
};