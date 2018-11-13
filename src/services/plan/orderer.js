'use strict';

const NodePlan = require('./plan');

module.exports = class OrdererPlan extends NodePlan {

    constructor(target){
        super(target);
        this.planName = 'OrdererPlan';
        this.targetName = 'OrdererTarget';
    }

    init(){
        this.plan.target(this.targetName,target);
        this.plan.remote(this.planName,function(remote){
            // task lists;
        });
    }

    run(){
        this.plan.run(this.planName,this.targetName);
        this.flushFinishedTasks();
    }

};