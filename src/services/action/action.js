'use strict';

module.exports = class Action {

    constructor(){
        this.context = null;
    }

    setActionContext(context){
        this.context = context;
    }

    async execute(){

    }

};