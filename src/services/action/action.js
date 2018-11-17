'use strict';

const Registry = require('./registry');

module.exports = class Action {

    constructor(){
        this.context = null;
        this.registry = Registry;
        this.isDebugMode = true;
    }

    setActionContext(context){
        this.context = context;
    }

    initialize(){

    }

    async execute(){

    }

    getRegistry(){
        return this.registry;
    }

};