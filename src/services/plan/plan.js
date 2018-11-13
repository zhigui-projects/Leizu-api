'use strict';

const plan = require('flightplan');

module.exports = class NodePlan {

    constructor(target){
        this.target = target;
        this.plan = plan;
    }

    setTarget(target){
        this.target = target;
    }

    setParameters(parameters){
        this.parameters = parameters;
    }

    flushFinishedTasks(){
        this.plan._targets = {};
        this.plan._flights = [];
    }
};