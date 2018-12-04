'use strict';

const path = require('path');
const DbService = require('../db/dao');
const common = require('../../libraries/common');
const installChaincode = require('./install-chaincode');
const instantiateChaincode = require('./instantiate-chaincode');

module.exports = class ChaincodeService {
    constructor(chaincodeName, chaincodeVersion) {
        this._chaincode_name = chaincodeName;
        this._chaincode_version = chaincodeVersion;
        this._peers = null;
        this._consortium_id = '';
    }

    static async getInstance(peers, chaincodeName, chaincodeVersion) {
        try {
            let chaincodeService = new ChaincodeService(chaincodeName, chaincodeVersion);
            await chaincodeService.init(peers);
            return chaincodeService;
        } catch (e) {
            throw e;
        }
    }

    static async getInstanceById(id) {
        try {
            let cc = await DbService.findChaincodeById(id);
            if (!cc) throw new Error('The chaincode has not been installed: ' + id);
            let chaincodeService = new ChaincodeService(cc.chaincode_name, cc.chaincode_version);
            chaincodeService._peers = JSON.parse(cc.peers);
            return chaincodeService;
        } catch (e) {
            throw e;
        }
    }

    async init(peers) {
        try {
            let peersInfo = {};
            for (let id of peers) {
                let peer = await DbService.findPeerById(id);
                if (!peer) throw new Error('The peer does not exist: ' + id);
                if (!peersInfo[peer.org_id]) peersInfo[peer.org_id] = [];
                peersInfo[peer.org_id].push(id);
                let consortium = await DbService.getConsortiumById(peer.consortium_id);
                if (!consortium) throw new Error('The consortium does not exist.');
                this._consortium_id = peer.consortium_id;
            }
            this._peers = peersInfo;
        } catch (e) {
            throw e;
        }
    }

    async installChaincode() {
        try {
            for (let orgId in this._peers) {
                let organization = await DbService.findOrganizationById(orgId);
                if (!organization) {
                    throw new Error('The organization does not exist: ' + orgId);
                }
                await installChaincode.installChaincode(this._peers[orgId], this._chaincode_name, path.join(common.CHAINCODE_PATH, common.CHAINCODE_TYPE_GOLANG, this._chaincode_name),
                    this._chaincode_version, common.CHAINCODE_TYPE_GOLANG, organization);
            }
            return DbService.addChaincode({
                name: this._chaincode_name,
                version: this._chaincode_version,
                path: path.join(common.CHAINCODE_PATH, common.CHAINCODE_TYPE_GOLANG),
                type: common.CHAINCODE_TYPE_GOLANG,
                peers: JSON.stringify(this._peers)
            });
        } catch (err) {
            throw err;
        }
    }

    async instantiateChaincode(channelName, functionName, args) {
        try {
            for (let orgId in this._peers) {
                let organization = await DbService.findOrganizationById(orgId);
                if (!organization) {
                    throw new Error('The organization does not exist: ' + orgId);
                }
                await instantiateChaincode.instantiateChaincode(this._peers[orgId], channelName, this._chaincode_name,
                    this._chaincode_version, functionName, common.CHAINCODE_TYPE_GOLANG, args, organization);
            }
            return DbService.addChaincode({
                name: this._chaincode_name,
                version: this._chaincode_version,
                path: path.join(common.CHAINCODE_PATH, common.CHAINCODE_TYPE_GOLANG),
                type: common.CHAINCODE_TYPE_GOLANG,
                peers: JSON.stringify(this._peers)
            });
        } catch (err) {
            throw err;
        }
    }
};