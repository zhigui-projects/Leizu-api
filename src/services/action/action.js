/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Registry = require('./registry');
const utils = require('../../libraries/utils');

module.exports = class Action {

    constructor(){
        this.context = null;
        this.registry = Registry;
        this.isDebugMode = utils.isSingleMachineTest();
    }

    setActionContext(context){
        this.context = context;
    }

    initialize(){

    }

    async execute(){

    }

    getRegistry(){
        return this.registry;
    }

};
