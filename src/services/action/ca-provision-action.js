'use strict';

const Action = require('./action');
const CAPlan = require('../plan/ca');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');

module.exports = class CAProvisionAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let caPlan = new CAPlan(params.caNode);
        let containerOptions = {
            name: params.caName,
            domainName: utils.generateDomainName(params.caName),
            port: common.PORT_CA
        };
        let parameters = {
            createContainerOptions: utils.generateCertAuthContainerCreateOptions(containerOptions)
        };
        caPlan.setParameters(parameters);
        caPlan.run();
    }

};