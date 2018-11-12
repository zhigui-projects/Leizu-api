'use strict';

const Registry = require('./registry');

module.exports = class ActionFactory {

    constructor(){

    }

    static getAction(resource,type){
        let actionName = resource + '-' + type;
        let actionFile = "./" + actionName + '-action';
        let ActionClass = require(actionFile);
        let actionInstance = new ActionClass();
        return actionInstance
    }

    static getActionRegistry(){
        return Registry;
    }

    static createActionContext(){
        return new Map();
    }

};