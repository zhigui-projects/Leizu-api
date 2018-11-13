'use strict';

const plan = require('flightplan');
const shellEscape = require('shell-escape');

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

    fullCommand(command, parameters){
        return [command].concat(shellEscape(parameters)).join(' ');
    }
};