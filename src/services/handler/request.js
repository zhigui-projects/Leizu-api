'use strict';

const logger = require('../../libraries/log4js');
logger.category = 'RequestHandler';
const Handler = require('./handler');
const RequestDaoService = require('../db/request');
const ActionFactory = require('../action/factory');
const RequestHelper = require('./request-helper');

module.exports = class RequestHandler extends Handler {

    constructor(ctx){
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

    async handlerRequest(){
        try{
            await this.persistRequest();
            this.decomposeRequest();
            await this.provisionNetwork();
        }catch(error){
            try{
                let rollBackAction = ActionFactory.getRequestRollbackAction({id:this.request._id});
                await rollBackAction.execute();
            }catch(err){
                logger.error(err);
            }
            throw error;
        }
    }

    async postRequest(){
        this.response =  this.request;
    }

    async persistRequest(){
        this.requestDaoService = new RequestDaoService();
        this.request = await this.requestDaoService.addRequest(this.ctx.request.body);
    }

    decomposeRequest(){
        this.parsedRequest = RequestHelper.decomposeRequest(this.ctx);
        this.parsedRequest.requestId = this.request._id;
        this.parsedRequest.consortiumId = this.request.consortiumId;
    }

    async updateRequestStatus(status){
        this.request.status = status;
        this.request = await this.requestDaoService.updateStatusById(this.request._id,status);
    }

    async provisionNetwork(){
        await this.provisionPeerOrganizations();
        await this.provisionPeers();
        await this.provisionOrdererOrganization();
        await this.provisionOrderers();
        //await this.createNewChannel();
        //await this.makePeersJoinChannel();
    }

    async provisionPeerOrganizations(){
        for(let peer of this.parsedRequest.peers){
            peer.consortiumId = this.parsedRequest.consortiumId;
            let provisionAction = ActionFactory.getCAProvisionAction(peer);
            this.organizations.peerOrgs[peer.orgName] = await provisionAction.execute();
        }
    }

    async provisionOrdererOrganization(){
        let orderer = this.parsedRequest.orderer;
        orderer.consortiumId = this.parsedRequest.consortiumId;
        let provisionAction = ActionFactory.getCAProvisionAction(orderer);
        this.organizations.ordererOrg[orderer.orgName] = await provisionAction.execute();
    }

    async provisionPeers(){
        for(let item of this.parsedRequest.peers){
            for(let node of item.nodes){
                let organization = this.organizations.peerOrgs[node.orgName];
                node.organizationId = organization._id;
                let provisionAction = ActionFactory.getPeerProvisionAction(node);
                this.peers[node.name] = await provisionAction.execute();
            }
        }
    }

    async provisionOrderers(){
        if(this.parsedRequest.isKafkaConsensus){
            let kafkaAction = ActionFactory.getKafkaProvisionAction(this.parsedRequest.kafkaCluster);
            let result = await kafkaAction.execute();
        }
        let node = this.parsedRequest.orderer.nodes[0];
        let organization = this.organizations.ordererOrg[this.parsedRequest.orderer.orgName];
        node.organizationId = organization._id;
        let provisionAction = ActionFactory.getOrdererProvisionAction(node);
        this.orderer = await provisionAction.execute();
    }

    async createNewChannel(){
        if(!this.parsedRequest.channel){
            throw new Error('no channel definition');
        }
        let organization = null;
        for(let org of this.organizations.peerOrgs){
            organization = org;
        }
        let parameters = {
            name: this.parsedRequest.channel.name,
            organizationId: organization._id
        };
        let createAction = ActionFactory.getChannelCreateAction(parameters);
        this.channel = await createAction.execute();
    }

    async makePeersJoinChannel(){
        let channelData = this.parsedRequest.channel;
        let channelName = channelData.name;
        let orderObject = this.orderer.toObject();
        let orderOrganization = this.organizations.ordererOrg[this.parsedRequest.orderer.orgName];
        let orderOrgObject = orderOrganization.toObject();
        let orderConfig =  {
            mspid: orderOrgObject.msp_id,
            sysChannel: common.SYSTEM_CHANNEL,
            url: orderObject.location,
            pem: orderObject.root_cert
        };
        for(let peer of this.peers){
            peer.channelName = channelName;
            peer.orderConfig = orderConfig;
            let joinAction = ActionFactory.getPeerJoinAction(peer);
            await joinAction.execute();
        }

    }
    
};

