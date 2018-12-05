/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const RequestContext = require('./context');

module.exports = class HttpHandler{

    constructor(ctx){
        this.ctx = ctx;
        this.context = new RequestContext();
        this.response = null;
    }

    setRequestContext(context){
        this.context = context;
    }

    async handle(){
        await this.preRequest();
        await this.handlerRequest();
        await this.postRequest();
        return this.response;
    }

    async preRequest(){

    }

    async handlerRequest(){

    }

    async postRequest(){

    }

};