/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Action = require('./action');
const CAdvisorService = require('../fabric/cadvisor');

module.exports = class CAdvisorAction extends Action {

    constructor() {
        super();
    }

    async execute() {
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        return await CAdvisorService.create(params);
    }

};