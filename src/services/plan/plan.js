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

    buildCreateContainerCommand(){
        let command = [];
        command.push('docker');
        command.push('create');
        command.concat(this.parameters.createContainerOptions);
        return this.fullCommand(command);
    }

    buildStartContainerCommand(containerId){
        let command = [];
        command.push('docker');
        command.push('start');
        command.push(containerId);
        return this.fullCommand(command);
    }

    fullCommand(args){
        return this.shellEscape(args);
    }

    shellEscape(a) {
        var ret = [];

        a.forEach(function(s) {
            if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
                s = "'"+s.replace(/'/g,"'\\''")+"'";
                s = s.replace(/^(?:'')+/g, '')
                    .replace(/\\'''/g, "\\'" );
            }
            ret.push(s);
        });

        return ret.join(' ');
    }
};