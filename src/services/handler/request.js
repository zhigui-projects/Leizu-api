/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const logger = require('../../libraries/log4js');
logger.category = 'RequestHandler';
const common = require('../../libraries/common');
const Handler = require('./handler');
const RequestDaoService = require('../db/request');
const ActionFactory = require('../action/factory');
const RequestHelper = require('./request-helper');

module.exports = class RequestHandler extends Handler {

    constructor(ctx) {
        super(ctx);
        this.request = null;
        this.requestDaoService = null;
        this.organizations = {
            peerOrgs: [],
            ordererOrg: {}
        };
        this.peers = {};
        this.orderer = {};
    }

    async handlerRequest() {
        try {
            await this.persistRequest();
            this.decomposeRequest();
            await this.provisionNetwork();
            await this.updateRequestStatus(common.REQUEST_STATUS_SUCCESS);
        } catch (error) {
            try {
                let rollBackAction = ActionFactory.getRequestRollbackAction({id: this.request._id});
                await rollBackAction.execute();
            } catch (err) {
                logger.error(err);
            }
            throw error;
        }
    }

    async postRequest() {
        try {
            let consortiumUpdateAction = ActionFactory.getConsortiumUpdateAction({requestId: this.request._id});
            await consortiumUpdateAction.execute();
        } catch (error) {
            logger.error(error);
        }
        this.response = this.request;
    }

    async persistRequest() {
        this.requestDaoService = new RequestDaoService();
        this.request = await this.requestDaoService.addRequest(this.ctx.request.body);
    }

    decomposeRequest() {
        this.parsedRequest = RequestHelper.decomposeRequest(this.ctx);
        this.parsedRequest.requestId = this.request._id;
        this.parsedRequest.consortiumId = this.request.consortiumId;
    }

    async updateRequestStatus(status) {
        this.request.status = status;
        let consortium = await this.requestDaoService.updateStatusById(this.request._id, status);
        this.request = Object.assign(this.request, consortium.toObject());
    }

    async provisionNetwork() {
        await this.provisionPeerOrganizations();
        await this.provisionPeers();
        if (process.env.RUN_MODE === common.RUN_MODE.REMOTE) {
            await this.provisionConsul();
        }
        await this.provisionOrdererOrganization();
        await this.provisionOrderers();
        await this.createNewChannel();
        await this.makePeersJoinChannel();
    }

    async provisionPeerOrganizations() {
        for (let peer of this.parsedRequest.peers) {
            peer.consortiumId = this.parsedRequest.consortiumId;
            let provisionAction = ActionFactory.getCAProvisionAction(peer);
            this.organizations.peerOrgs[peer.orgName] = await provisionAction.execute();
        }
    }

    async provisionOrdererOrganization() {
        let orderer = this.parsedRequest.orderer;
        orderer.consortiumId = this.parsedRequest.consortiumId;
        let provisionAction = ActionFactory.getCAProvisionAction(orderer);
        this.organizations.ordererOrg[orderer.orgName] = await provisionAction.execute();
    }

    async provisionPeers() {
        for (let item of this.parsedRequest.peers) {
            for (let node of item.nodes) {
                let organization = this.organizations.peerOrgs[node.orgName];
                node.organizationId = organization._id;
                node.image = this.parsedRequest.peerImage;
                let provisionAction = ActionFactory.getPeerProvisionAction(node);
                this.peers[node.name] = await provisionAction.execute();
            }
        }
    }

    async provisionConsul() {
        let ipList = [];
        for (let item of this.parsedRequest.consuls) {
            if (ipList.indexOf(item.host) === -1) {
                let provisionAction = ActionFactory.getConsulCreateAction(item);
                await provisionAction.execute();
                ipList.push(item.host);
            }

        }
    }

    async provisionOrderers() {
        let kafkaBrokers = [];
        if (this.parsedRequest.isKafkaConsensus) {
            let kafkaAction = ActionFactory.getKafkaProvisionAction(this.parsedRequest.kafkaCluster);
            kafkaBrokers = await kafkaAction.execute();
        }
        let node = this.parsedRequest.orderer.nodes[0];

        let peerOrganizationIds = [];
        for (let property in this.organizations.peerOrgs) {
            let organization = this.organizations.peerOrgs[property];
            if (organization) {
                peerOrganizationIds.push(organization._id);
            }
        }
        node.organizationId = this.organizations.ordererOrg[this.parsedRequest.orderer.orgName]._id;
        // node.organizationId = peerOrganizationIds[0];
        node.peerOrganizationIds = peerOrganizationIds;
        node.kafkaBrokers = kafkaBrokers;
        node.ordererType = this.parsedRequest.consensus;
        node.image = this.parsedRequest.ordererImage;
        let provisionAction = ActionFactory.getOrdererProvisionAction(node);
        this.orderer = await provisionAction.execute();
    }

    async createNewChannel() {
        if (!this.parsedRequest.channel) {
            throw new Error('no channel definition');
        }
        let organizationIds = [];
        for (let property in this.organizations.peerOrgs) {
            let organization = this.organizations.peerOrgs[property];
            if (organization) {
                if (!this.parsedRequest.channel.orgs || this.parsedRequest.channel.orgs.length === 0) {
                    organizationIds.push(organization._id);
                } else if (this.parsedRequest.channel.orgs.indexOf(organization.name) !== -1) {
                    organizationIds.push(organization._id);
                }
            }
        }
        if (organizationIds.length === 0) {
            throw new Error('no channel orgs definition');
        }
        let parameters = {
            name: this.parsedRequest.channel.name,
            organizationIds: organizationIds
        };
        let createAction = ActionFactory.getChannelCreateAction(parameters);
        this.channel = await createAction.execute();
    }

    async makePeersJoinChannel() {
        let channelName = this.parsedRequest.channel.name;
        for (let property in this.organizations.peerOrgs) {
            let organization = this.organizations.peerOrgs[property];
            if (!organization) continue;
            if (this.parsedRequest.channel.orgs && this.parsedRequest.channel.orgs.length > 0
                && this.parsedRequest.channel.orgs.indexOf(organization.name) === -1) continue;
            let parameters = {};
            parameters.organization = organization;
            parameters.channelName = channelName;
            parameters.channelId = this.channel._id;
            let joinAction = ActionFactory.getPeerJoinAction(parameters);
            await joinAction.execute();
        }
    }

};

