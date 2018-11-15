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
        }catch(err){
            try{
                let rollBackAction = ActionFactory.getRequestRollbackAction({id:this.request._id});
                await rollBackAction.execute();
            }catch(ex){
                logger.error(ex);
                throw ex;
            }
            logger.error(err);
            throw err;
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
        this.parsedRequest = RequestHelper.decomposeRequest(this.ctx,this.request);
    }

    async updateRequestStatus(status){
        this.request.status = status;
        this.request = await this.requestDaoService.updateStatusById(this.request._id,status);
    }

    async provisionNetwork(){
        await this.provisionPeerOrganizations();
        await this.provisionPeers();
        await this.provisionOrdererOrganization();
        await this.prepareGenesisBlocks();
        await this.provisionOrderers();
        await this.makePeersJoinChannel();
    }

    async provisionPeerOrganizations(){
        for(let peer of this.parsedRequest.peers){
            let provisionAction = ActionFactory.getCAProvisionAction(peer);
            this.organizations.peerOrgs[peer.orgName] = await provisionAction.execute();
        }
    }

    async provisionOrdererOrganization(){
        let orderer = this.parsedRequest.orderer;
        let provisionAction = ActionFactory.getCAProvisionAction(orderer);
        this.organizations.ordererOrg[orderer.orgName] = await provisionAction.execute();
    }

    async prepareGenesisBlocks(){

    }

    async provisionPeers(){
        for(let peer of this.parsedRequest.peers){
            let provisionAction = ActionFactory.getPeerProvisionAction(peer);
            this.peers[peer.name] = await provisionAction.execute();
        }
    }

    async provisionOrderers(){
        let provisionAction = ActionFactory.getOrdererProvisionAction(this.parsedRequest.orderer);
        this.orderer = await provisionAction.execute();
    }

    async makePeersJoinChannel(){

    }
    
};

