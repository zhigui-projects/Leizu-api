'use strict';

const Action = require('./action');
const OrdererPlan = require('../plan/orderer');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');

module.exports = class OrdererProvisionAction extends Action {

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let ordererPlan = new OrdererPlan(params);
        let containerOptions = {
            name: params.name,
            domainName: utils.generateDomainName(params.name),
            port: common.PORT_ORDERER
        };
        let parameters = {
            createContainerOptions: utils.generateOrdererCreateOptions(containerOptions)
        };
        ordererPlan.setParameters(parameters);
        ordererPlan.run();
    }

};