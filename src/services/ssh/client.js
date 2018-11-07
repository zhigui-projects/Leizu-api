'use strict';

const NodeSSH = require('node-ssh');
const AbstractSSH = require('./ssh');

module.exports = class ZigClient extends AbstractSSH {

    constructor(options){
        super(options);
    }

    async createContainer(parameters){
        let sshClient = new NodeSSH();
        try{
            await sshClient.connect(this.options);
            let containerParameters = this.getContainerParameters();
            let containerId = await sshClient.exec("docker",containerParameters);
            let container = await sshClient.exec("docker",['start',containerId]);
            await sshClient.dispose();
            return container;
        }catch (e) {
            throw e;
        }

    }

    getContainerParameters(parameters){
        return parameters;
    }

};