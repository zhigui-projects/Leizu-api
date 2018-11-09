'use strict';


module.exports = class HttpHandler{

    constructor(ctx){
        this.ctx = ctx;
        this.data = null;
    }

    async handle(ctx){
        await this.preRequest(ctx);
        await this.handlerRequest(ctx);
        await this.postRequest(ctx);
        return this.data;
    }

    async preRequest(ctx){

    }

    async handlerRequest(ctx){

    }

    async postRequest(ctx){

    }

};