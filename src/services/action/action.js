'use strict';

const Registry = require('./registry');

module.exports = class Action {

    constructor(){
        this.context = null;
        this.registry = Registry;
        this.isDebugMode = false;
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