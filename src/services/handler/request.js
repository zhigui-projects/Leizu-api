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

    decomposeRequest(){
        this.peers = [];
        if(this.request.getConsensusType() == common.CONSENSUS_SOLO){
            this.orderers = [];
        }else{
            this.orderers = [];
            this.kafkas = [];
            this.zookeepers = [];
        }
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

    }

    async prepareGenesisBlocks(){

    }

    async provisionPeers(){

    }

    async provisionOrderers(){

    }

    async makePeersJoinChannel(){

    }
    
};

