'use strict';

const Handler = require('./handler');
const Request = require('../db/request');

module.exports = class RequestHandler extends Handler {

    constructor(ctx){
        super(ctx);
        this.request = null;
    }

    async preRequest(){

    }

    async handlerRequest(){
        await this.storeRequest();
        try{
            await this.provisionNetwork();
        }catch(err){

        }
    }

    async postRequest(){

    }

    async storeRequest(){
        this.request = new Request();
        this.data = await this.request.load(this.ctx.request.body);
    }

    async provisionNetwork(){
        await this.provisionPeers();
        await this.provisionOrderers();
    }

    async provisionPeers(){

    }

    async provisionOrderers(){

    }

    async updateRequestStatus(){

    }
    
};

