'use strict';

const Handler = require('./handler');
const Request = require('../db/request');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const ActionFactory = require('../action/factory');
const RequestHelper = require('./request-helper');

module.exports = class RequestHandler extends Handler {

    constructor(ctx){
        super(ctx);
        this.request = null;
        this.organizations = {};
        this.peers = {};
    }

    async handlerRequest(){
        await this.persistRequest();
        try{
            this.decomposeRequest();
            await this.provisionNetwork();
        }catch(err){
            logger.error(err);
            try{
                let rollBackAction = ActionFactory.getRequestRollbackAction({id:'to-be-id'});
                await rollBackAction.execute();
            }catch(ex){
                throw ex;
            }
            throw err;
        }
        return this.request;
    }

    async persistRequest(){
        let request = new Request();
        this.request = await request.load(this.ctx.request.body);
    }

    decomposeRequest(){
        this.parsedRequest = RequestHelper.decomposeRequest(this.ctx,this.request);
    }

    async updateRequestStatus(status){
        this.request.status = status;
        this.request = await Request.findOneAndUpdate({_id: this.request._id},{status: status});
    }

    async provisionNetwork(){
        await this.provisionOrganizations();
        await this.provisionPeers();
        await this.prepareGenesisBlocks();
        await this.provisionOrderers();
        await this.makePeersJoinChannel();
    }

    async provisionOrganizations(){
        for(let org in this.parsedRequest.orgs){
            let provisionAction = ActionFactory.getCAProvisionAction(org);
            this.organizations[org.name] = await provisionAction.execute();
        }
    }

    async prepareGenesisBlocks(){

    }

    async provisionPeers(){
        for(let peer in this.parsedRequest.peers){
            let provisionAction = ActionFactory.getPeerProvisionAction(peer);
            this.peers[peer.name] = await provisionAction.execute();
        }
    }

    async provisionOrderers(){
        let provisionAction = ActionFactory.getOrdererProvisionAction(this.parsedRequest.OrgOrderer);
        this.orderer = await provisionAction.execute();
    }

    async makePeersJoinChannel(){

    }
    
};

