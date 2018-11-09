'use strict';

const Handler = require('./handler');
const Request = require('../db/request');

module.exports = class RequestHandler extends Handler {

    constructor(ctx){
        super(ctx);
    }

    async preRequest(ctx){

    }

    async handlerRequest(ctx){
        let request = new Request();
        this.data = await request.load(ctx.request.body);
    }

    async postRequest(ctx){

    }

};

