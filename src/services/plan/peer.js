/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const NodePlan = require('./plan');

module.exports = class PeerPlan extends NodePlan {

    constructor(target){
        super(target);
        this.planName = 'PeerPlan';
        this.targetName = 'PeerTarget';
    }

    init(){
        let self = this;
        this.plan.target(this.targetName,this.target);
        this.plan.remote(this.planName,function(remote){
            let createCommand = self.buildCreateContainerCommand();
            let result = remote.exec(createCommand);
            let startCommand = self.buildStartContainerCommand(result.stdout);
            remote.exec(startCommand);
        });
    }

    run(){
        this.init();
        this.plan.run(this.planName,this.targetName);
        this.flushFinishedTasks();
    }


};