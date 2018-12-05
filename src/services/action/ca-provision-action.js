/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

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
            caPort: common.PORT.CA
        };
        utils.extend(options,params.caNode);
        if(this.isDebugMode){
            options.caPort = utils.generateRandomHttpPort();
        }
        return await OrganizationService.create(options);
    }

};