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

    static getRequestRollbackAction(params){
        let rollBackAction = module.exports.ActionFactory.getAction(Registry.RESOURCE.REQUEST,Registry.TYPE.ROLLBACK);
        let actionContext = module.exports.ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.CONSORTIUM_ID,params.id);
        rollBackAction.setActionContext(actionContext);
        return rollBackAction;
    }

    static getCAProvisionAction(params){
        let provisionAction = module.exports.ActionFactory.getAction(Registry.RESOURCE.CA,Registry.TYPE.PROVISION);
        let actionContext = module.exports.ActionFactory.createActionContext();
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

    static getOrdererProvisionAction(params){
        let provisionAction = module.exports.ActionFactory.getAction(Registry.RESOURCE.ORDERER,Registry.TYPE.PROVISION);
        let actionContext = module.exports.ActionFactory.createActionContext();
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

    static getPeerProvisionAction(params){
        let provisionAction = module.exports.ActionFactory.getAction(Registry.RESOURCE.PEER,Registry.TYPE.PROVISION);
        let actionContext = module.exports.ActionFactory.createActionContext();
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

};