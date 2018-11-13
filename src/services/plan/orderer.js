'use strict';

const NodePlan = require('./plan');

module.exports = class OrdererPlan extends NodePlan {

    constructor(target){
        super(target);
        this.planName = 'OrdererPlan';
        this.targetName = 'OrdererTarget';
    }

    init(){
        let self = this;
        this.plan.target(this.targetName,target);
        this.plan.remote(this.planName,function(remote){
            let createCommand = self.buildCreateContainerCommand();
            let result = remote.exec(createCommand);
            let startCommand = self.buildStartContainerCommand(result.stdout);
            remote.exec(startCommand);
        });
    }

    run(){
        this.plan.run(this.planName,this.targetName);
        this.flushFinishedTasks();
    }

};