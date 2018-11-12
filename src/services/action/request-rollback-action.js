'use strict';

const Action = require('./action');

module.exports = class RequestRollBackAction extends Action {

    constructor(){
        super();
    }

    async execute(){

    }

    getConsortiumId(){
        return this.context.get(this.registry.CONTEXT.CONSORTIUM_ID);
    }
};