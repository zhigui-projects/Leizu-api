/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const DbService = require('../../db/dao');
const common = require('../../../libraries/common');
const installChaincode = require('./install-chaincode');
const instantiateChaincode = require('./instantiate-chaincode');
const upgradeChaincode = require('./upgrade-chaincode');
const invokeChaincode = require('./invoke-chaincode');
const queryChaincode = require('./query-chaincode');

module.exports = class ChaincodeService {
    constructor(chaincodeId, peers) {
        this._chaincodeId = chaincodeId;
        this._chaincodeName = '';
        this._chaincodeVersion = '';
        this._chaincodePath = '';
        this._chaincodeState = common.CHAINCODE_STATE_NONE;
        this._peers = peers;
        this._peersInfo = null;
    }

    static async getInstance(id, peers) {
        try {
            let chaincodeService = new ChaincodeService(id, peers);
            await chaincodeService.init();
            return chaincodeService;
        } catch (err) {
            throw err;
        }
    }

    async init() {
        try {
            let cc = await DbService.findChaincodeById(this._chaincodeId);
            if (!cc) {
                throw new Error('The chaincode does not exist: ' + this._chaincodeId);
            }
            this._chaincodeName = cc.name;
            this._chaincodeVersion = cc.version;
            this._chaincodePath = cc.path;
            if (!this._peers && !cc.peers) {
                throw new Error('No peers was found');
            }
            this._peers = this._peers ? this._peers : cc.peers;
            this._chaincodeState = cc.state;
            await this.getPeersInfo();
        } catch (err) {
            throw err;
        }
    }

    async getPeersInfo() {
        try {
            let peersInfo = {};
            for (let id of this._peers) {
                let peer = await DbService.findPeerById(id);
                if (!peer) throw new Error('The peer does not exist: ' + id);
                if (!peersInfo[peer.org_id]) peersInfo[peer.org_id] = [];
                peersInfo[peer.org_id].push(id);
            }
            this._peersInfo = peersInfo;
        } catch (err) {
            throw err;
        }
    }

    /*Roles allowed in the endorsement policy to be checked by VSCC:
     i. peer
     ii. client
     iii. member
     iv. admin
    {
        "identities": [
            { "role": { "name": "member", "mspId": "Org1MSP" }},
            { "role": { "name": "member", "mspId": "Org2MSP" }}
            ],
        "policy": {
            "1-of": [{ "signed-by": 0 }, { "signed-by": 1 }]
        }
    }*/
    static async buildEndorsementPolicy(orgIds) {
        if (!orgIds || orgIds.length === 0) {
            throw new Error('No organization was found');
        }
        let endorsementPolicy = {identities: [], policy: {}};
        for (let orgId of orgIds) {
            let organization = await DbService.findOrganizationById(orgId);
            if (!organization) {
                throw new Error('The organization does not exist: ' + orgId);
            }
            endorsementPolicy.identities.push({role: {name: 'member', mspId: organization.msp_id}});
        }
        let signRoles = [];
        for (let i in endorsementPolicy.identities) {
            signRoles.push({'signed-by': parseInt(i)});
        }
        let signNum = Math.ceil(endorsementPolicy.identities.length / 2) + 1;
        endorsementPolicy.policy[`${signNum}-of`] = signRoles;
        return endorsementPolicy;
    }

    static async uploadChaincode(params) {
        let {chaincodeName, chaincodeVersion, chaincodeType, chaincodePath} = params;
        chaincodeType = chaincodeType ? chaincodeType : common.CHAINCODE_TYPE_GOLANG;
        try {
            let cc = await DbService.addChaincode({
                name: chaincodeName,
                version: chaincodeVersion,
                path: chaincodePath,
                type: chaincodeType,
                state: common.CHAINCODE_STATE_NONE
            });
            return cc;
        } catch (err) {
            throw err;
        }
    }

    async installChaincode() {
        try {
            if (this._chaincodeState !== common.CHAINCODE_STATE_NONE) {
                throw new Error('The chaincode can not be installed, state: ' + this._chaincodeState);
            }
            for (let orgId in this._peersInfo) {
                let organization = await DbService.findOrganizationById(orgId);
                if (!organization) {
                    throw new Error('The organization does not exist: ' + orgId);
                }
                await installChaincode.installChaincode(this._peersInfo[orgId], this._chaincodeName, this._chaincodePath,
                    this._chaincodeVersion, common.CHAINCODE_TYPE_GOLANG, organization);
            }

            let cc = await DbService.findChaincodeAndUpdate(this._chaincodeId, {
                peers: this._peers,
                state: common.CHAINCODE_STATE_INSTALLED
            });
            cc.peers = this._peers;
            cc.state = common.CHAINCODE_STATE_INSTALLED;
            return cc;
        } catch (err) {
            throw err;
        }
    }

    async instantiateAndUpgradeChaincode(channelId, functionName, args, opt) {
        try {
            if (this._chaincodeState !== common.CHAINCODE_STATE_INSTALLED) {
                throw new Error('The chaincode can not be instantiated or upgraded, state: ' + this._chaincodeState);
            }
            let channel = await DbService.getChannelById(channelId);
            if (!channel) {
                throw new Error('The channel does not exist: ' + channelId);
            }
            let endorsementPolicy = await ChaincodeService.buildEndorsementPolicy(channel.orgs);

            let orgIds = Object.getOwnPropertyNames(this._peersInfo);
            if (!orgIds || orgIds.length === 0) {
                throw new Error('No organization was found');
            }
            let orgId = orgIds[0];
            let organization = await DbService.findOrganizationById(orgId);
            if (!organization) {
                throw new Error('The organization does not exist: ' + orgId);
            }
            let chaincodeState;
            if (opt === 'instantiate') {
                await instantiateChaincode.instantiateChaincode(this._peersInfo[orgId], channel.name, this._chaincodeName,
                    this._chaincodeVersion, functionName, common.CHAINCODE_TYPE_GOLANG, args, organization, endorsementPolicy);
                chaincodeState = common.CHAINCODE_STATE_DEPLOYED;
            } else if (opt === 'upgrade') {
                await upgradeChaincode.upgradeChaincode(this._peersInfo[orgId], channel.name, this._chaincodeName,
                    this._chaincodeVersion, functionName, common.CHAINCODE_TYPE_GOLANG, args, organization, endorsementPolicy);
                chaincodeState = common.CHAINCODE_STATE_UPGRADED;
            }
            let cc = await DbService.findChaincodeAndUpdate(this._chaincodeId, {
                state: chaincodeState,
                channel_id: channelId
            });
            cc.state = chaincodeState;
            return cc;
        } catch (err) {
            throw err;
        }
    }

    async invokeChaincode(channelId, functionName, args) {
        try {
            if (this._chaincodeState < common.CHAINCODE_STATE_DEPLOYED) {
                throw new Error('The chaincode has not been instantiated, state: ' + this._chaincodeState);
            }
            let channel = await DbService.getChannelById(channelId);
            if (!channel) {
                throw new Error('The channel does not exist: ' + channelId);
            }

            let orgIds = Object.getOwnPropertyNames(this._peersInfo);
            if (!orgIds || orgIds.length === 0) {
                throw new Error('No organization was found');
            }
            let orgId = orgIds[1];
            let organization = await DbService.findOrganizationById(orgId);
            if (!organization) {
                throw new Error('The organization does not exist: ' + orgId);
            }
            return invokeChaincode.invokeChaincode(this._peers, organization, channel.name, this._chaincodeName, functionName, args);
        } catch (err) {
            throw err;
        }
    }

    async queryChaincode(channelId, functionName, args) {
        try {
            if (this._chaincodeState < common.CHAINCODE_STATE_DEPLOYED) {
                throw new Error('The chaincode has not been instantiated, state: ' + this._chaincodeState);
            }
            let channel = await DbService.getChannelById(channelId);
            if (!channel) {
                throw new Error('The channel does not exist: ' + channelId);
            }

            let orgIds = Object.getOwnPropertyNames(this._peersInfo);
            if (!orgIds || orgIds.length === 0) {
                throw new Error('No organization was found');
            }
            let orgId = orgIds[0];
            let organization = await DbService.findOrganizationById(orgId);
            if (!organization) {
                throw new Error('The organization does not exist: ' + orgId);
            }
            return queryChaincode.queryChaincode(this._peers, organization, channel.name, this._chaincodeName, functionName, args);
        } catch (err) {
            throw err;
        }
    }
};