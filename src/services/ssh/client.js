'use strict';

const NodeSSH = require('node-ssh');
const AbstractSSH = require('./ssh');
const log4js = require('log4js');

module.exports = class SSHClient extends AbstractSSH {

    constructor(options) {
        super(options);
        this.cmd = options.cmd || 'docker';
        this.logger = log4js.getLogger(name);
    }

    async createContainer(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            let containerParameters = this.getContainerParameters(parameters);
            let containerId = await sshClient.exec(this.cmd, containerParameters);
            let container = await sshClient.exec(this.cmd, ['start', containerId]);
            await sshClient.dispose();
            return container;
        } catch (ex) {
            this.logger.error(ex);
            throw ex;
        }
    }

    async transferFile(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            await sshClient.putFile(parameters.local, parameters.remote);
            await sshClient.dispose();
        } catch (ex) {
            this.logger.error(ex);
            throw ex;
        }
    }

    async exec(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            await sshClient.exec(this.cmd, parameters);
            await sshClient.dispose();
        } catch (ex) {
            this.logger.error(ex);
            throw ex;
        }
    }

    getContainerParameters(parameters) {
        return parameters;
    }

};