'use strict';

const Action = require('./action');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const OrderService = require('../fabric/orderer');

module.exports = class OrdererProvisionAction extends Action {

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let options = {
            name: params.name,
            domainName: utils.generateDomainName(params.name),
            port: common.PORT.ORDERER,
            workingDir: '/opt',
            ordererName: params.name,
            mspid: 'OrgOrderer'
        };
        if(this.isDebugMode){
            options.port = utils.generateRandomHttpPort();
        }
        //return await OrderService.create(options);
    }

};