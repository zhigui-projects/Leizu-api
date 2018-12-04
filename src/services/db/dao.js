'use strict';

const uuid = require('uuid/v1');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Consortium = require('../../models/consortium');
const CertAuthority = require('../../models/certauthority');
const Chaincode = require('../../models/chaincode');
const Common = require('../../libraries/common');

module.exports = class DbService {

    static async getChannels() {
        let channels = await Channel.find();
        return channels;
    }

    static async getChannelsByCondition(where) {
        let channels = await Channel.find(where);
        return channels;
    }

    static async getChannelByName(channelName) {
        let channel = await Channel.findOne({name: channelName});
        return channel;
    }

    static async getChannelById(id) {
        let channel = await Channel.findById(id);
        return channel;
    }

    static async countChannelByConsortiumId(consortiumId) {
        let count = await Channel.count({consortium_id: consortiumId});
        return count;
    }

    static async getConsortiums() {
        let consortiums = await Consortium.find();
        return consortiums;
    }

    static async getConsortiumById(id) {
        let consortium = await Consortium.findById(id);
        return consortium;
    }

    static async addConsortium(dto) {
        let consortium = new Consortium();
        consortium.name = dto.name;
        consortium.uuid = uuid();
        consortium.network_config = JSON.stringify(dto);
        consortium = await consortium.save();
        return consortium;
    }

    static async findPeers() {
        let peers = await Peer.find();
        return peers;
    }

    static async findPeerById(id) {
        let peer = await Peer.findById(id);
        return peer;
    }

    static async findOrdererById(id) {
        let orderer = await Peer.findOne({_id: id, type: Common.PEER_TYPE_ORDER});
        return orderer;
    }

    static async findOrderes() {
        let orderers = await Peer.find({type: Common.PEER_TYPE_ORDER});
        return orderers;
    }

    static async findPeersByOrgId(orgId, type) {
        let condition = {org_id: orgId};
        if (type === 0 || type === 1) {
            condition.type = type;
        }
        return await Peer.find(condition);
    }

    static async addPeer(dto) {
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = dto.name;
        peer.location = dto.location;
        peer.org_id = dto.organizationId;
        peer.consortium_id = dto.consortiumId;
        peer.sign_key = dto.adminKey;
        peer.sign_cert = dto.signcerts;
        peer.tls_key = dto.tls.key;
        peer.tls_cert = dto.tls.cert;
        peer = await peer.save();
        return peer;
    }

    static async countPeersByConsortiumId(consortiumId) {
        let count = await Peer.countDocuments({consortium_id: consortiumId});
        return count;
    }

    static async countPeersByOrg(orgId) {
        let data = await Peer.aggregate([
            {$match: {'org_id': {$in: orgId}}},
            {
                $group: {
                    _id: '$org_id',
                    total: {$sum: 1}
                }
            }
        ]);
        return data;
    }

    static async addOrderer(dto) {
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = dto.name;
        peer.location = dto.location;
        peer.org_id = dto.organizationId;
        peer.type = Common.PEER_TYPE_ORDER;
        peer.consortium_id = dto.consortiumId;
        peer.sign_key = dto.adminKey;
        peer.sign_cert = dto.signcerts;
        peer.tls_key = dto.tls.key;
        peer.tls_cert = dto.tls.cert;
        peer = await peer.save();
        return peer;
    }

    static async findOrganizations() {
        let organizations = await Organization.find();
        return organizations;
    }

    static async getOrganizationsByIds(orgIds) {
        let where = {};
        if (orgIds && orgIds.length > 0) {
            where = {_id: orgIds};
        }
        let organizations = await Organization.find(where);
        return organizations;
    }

    static async countOrgsByConsortiumId(consortiumId) {
        let count = await Organization.countDocuments({consortium_id: consortiumId});
        return count;
    }

    static async findOrganizationById(id) {
        let organization = await Organization.findById(id);
        return organization;
    }

    static async addOrganization(dto) {
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.orgName;
        organization.domain_name = dto.domainName;
        organization.msp_id = dto.mspId;
        organization.admin_key = dto.adminKey;
        organization.admin_cert = dto.adminCert;
        organization.root_cert = dto.rootCert;
        organization.msp_path = dto.mspPath;
        organization.consortium_id = dto.consortiumId;
        organization = await organization.save();
        return organization;
    }

    static async addCertAuthority(dto) {
        let certAuthority = new CertAuthority();
        certAuthority.uuid = uuid();
        certAuthority.name = dto.name;
        certAuthority.url = dto.url;
        certAuthority.org_id = dto.orgId;
        certAuthority.consortium_id = dto.consortiumId;
        certAuthority.enroll_id = dto.enrollId || Common.BOOTSTRAPUSER.enrollmentID;
        certAuthority.enroll_secret = dto.enrollSecret || Common.BOOTSTRAPUSER.enrollmentSecret;
        certAuthority = certAuthority.save();
        return certAuthority;
    }

    static async findCertAuthorityByOrg(orgId) {
        return await CertAuthority.findOne({org_id: orgId});
    }

    static async findOrdererByConsortium(consortiumId) {
        let orderer = await Peer.findOne({consortium_id: consortiumId, type: Common.PEER_TYPE_ORDER});
        if (!orderer) {
            throw new Error('can not found any orderer for consortium: ' + consortiumId);
        }
        return orderer;
    }

    static async getCaByOrgId(orgId) {
        let ca = await CertAuthority.findOne({org_id: orgId});
        if (!ca) {
            throw new Error('can not found ca server for ' + orgId);
        }
        return {
            url: ca.url,
            name: ca.name,
            enrollId: ca.enroll_id,
            enrollSecret: ca.enroll_secret
        };
    }

    static async findOrganizationByName(consortiumId, name) {
        try {
            let organization = await Organization.findOne({consortium_id: consortiumId, name: name});
            return organization;
        } catch (err) {
            return null;
        }
    }

    static async addChaincode(dto) {
        let cc = new Chaincode();
        cc.uuid = uuid();
        cc.name = dto.name;
        cc.path = dto.path;
        cc.version = dto.version;
        cc.language = dto.type;
        cc.peers = dto.peers;
        return cc.save();
    }

    static async findChaincodeById(id) {
        return Chaincode.findById(id);
    }
};
