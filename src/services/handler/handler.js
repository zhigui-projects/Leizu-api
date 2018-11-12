'use strict';

const RequestContext = require('./context');

module.exports = class HttpHandler{

    constructor(ctx){
        this.ctx = ctx;
        this.context = new RequestContext();
        this.data = null;
    }

    setRequestContext(context){
        this.context = context;
    }

    async handle(){
        await this.preRequest();
        await this.handlerRequest();
        await this.postRequest();
        return this.data;
    }

    async preRequest(){

    }

    async handlerRequest(){

    }

    async postRequest(){

    }

};