'use strict';

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

};