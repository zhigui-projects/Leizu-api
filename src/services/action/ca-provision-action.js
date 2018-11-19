'use strict';

const Action = require('./action');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const OrganizationService = require('../fabric/organization');

module.exports = class CAProvisionAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let options = {
            name: params.caName,
            consortiumId: params.consortiumId.toString(),
            domainName: utils.generateDomainName(params.caName),
            caPort: common.PORT_CA
        };
        utils.extend(options,params.caNode);
        if(this.isDebugMode){
            options.caPort = utils.generateRandomHttpPort();
            console.info(">>>debug info", options);
        }
        return await OrganizationService.create(options);
    }

};