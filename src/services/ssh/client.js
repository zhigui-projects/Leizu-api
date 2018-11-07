'use strict';

const NodeSSH = require('node-ssh');
const AbstractSSH = require('./ssh');

module.exports = class SSHClient extends AbstractSSH {

    constructor(options){
        super(options);
        this.cmd = options.cmd || 'docker';
    }

    async createContainer(parameters){
        let sshClient = new NodeSSH();
        try{
            await sshClient.connect(this.options);
            let containerParameters = this.getContainerParameters(parameters);
            let containerId = await sshClient.exec(this.cmd,containerParameters);
            let container = await sshClient.exec(this.cmd,['start',containerId]);
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