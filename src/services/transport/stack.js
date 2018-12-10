/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const plan = require('flightplan');

module.exports = class StackPlan {

    static addTarget(name, target){
        plan.target(name,target);
    }

    static addRemoteTask(planName,fn){
        plan.remote(planName,fn);
    }

    static runPlan(planName, target){
        plan.run(planName,target);
    }
};
