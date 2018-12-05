/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Registry = require('./registry');

module.exports = class ActionFactory {

    constructor() {

    }

    static getAction(resource, type) {
        let actionName = resource + '-' + type;
        let actionFile = './' + actionName + '-action';
        let ActionClass = require(actionFile);
        let actionInstance = new ActionClass();
        return actionInstance;
    }

    static getActionRegistry() {
        return Registry;
    }

    static createActionContext() {
        return new Map();
    }

    static getRequestRollbackAction(params) {
        let rollBackAction = ActionFactory.getAction(Registry.RESOURCE.REQUEST, Registry.TYPE.ROLLBACK);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.REQUEST_ID, params.id);
        rollBackAction.setActionContext(actionContext);
        return rollBackAction;
    }

    static getCAProvisionAction(params) {
        let provisionAction = ActionFactory.getAction(Registry.RESOURCE.CA, Registry.TYPE.PROVISION);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

    static getOrdererProvisionAction(params) {
        let provisionAction = ActionFactory.getAction(Registry.RESOURCE.ORDERER, Registry.TYPE.PROVISION);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

    static getPeerProvisionAction(params) {
        let provisionAction = ActionFactory.getAction(Registry.RESOURCE.PEER, Registry.TYPE.PROVISION);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

    static getPeerJoinAction(params) {
        let joinAction = ActionFactory.getAction(Registry.RESOURCE.PEER, Registry.TYPE.JOIN);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        joinAction.setActionContext(actionContext);
        return joinAction;
    }

    static getKafkaProvisionAction(params) {
        let provisionAction = ActionFactory.getAction(Registry.RESOURCE.KAFKA, Registry.TYPE.PROVISION);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        provisionAction.setActionContext(actionContext);
        return provisionAction;
    }

    static getChannelCreateAction(params) {
        let createAction = ActionFactory.getAction(Registry.RESOURCE.CHANNEL, Registry.TYPE.CREATE);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        createAction.setActionContext(actionContext);
        return createAction;
    }

    static getConsortiumUpdateAction(params) {
        let updateAction = ActionFactory.getAction(Registry.RESOURCE.CONSORTIUM, Registry.TYPE.UPDATE);
        let actionContext = ActionFactory.createActionContext();
        actionContext.set(Registry.CONTEXT.PARAMS, params);
        updateAction.setActionContext(actionContext);
        return updateAction;
    }

};