'use strict';

const Handler = require('./handler');
const Request = require('../db/request');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');

module.exports = class RequestHandler extends Handler {

    constructor(ctx){
        super(ctx);
        this.request = null;
    }

    async handlerRequest(){
        await this.persistRequest();
        try{
            this.decomposeRequest();
            await this.provisionNetwork();
        }catch(err){
            logger.error(err);
        }
    }

    async persistRequest(){
        let request = new Request();
        this.request = await request.load(this.ctx.request.body);
    }

    async provisionNetwork(){
        await this.provisionPeers();
        await this.provisionOrderers();
    }

    decomposeRequest(){
        this.peers = [];
        if(this.request.getConsensusType() == common.CONSENSUS_SOLO){

        }else{

        }
    }

    async provisionPeers(){

    }

    async provisionOrderers(){

    }

    async updateRequestStatus(status){
        this.request.status = status;
        this.request = await Request.findOneAndUpdate({_id: this.request._id},{status: status});
    }
    
};

