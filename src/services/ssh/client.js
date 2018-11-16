'use strict';

const NodeSSH = require('node-ssh');
const AbstractSSH = require('./ssh');
const logger = require('log4js').getLogger('SSHClient');

module.exports = class SSHClient extends AbstractSSH {

    constructor(options) {
        super(options);
        this.cmd = options.cmd || 'docker';
    }

    async createContainer(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            let containerId = await sshClient.exec(this.cmd, parameters);
            let container = await sshClient.exec(this.cmd, ['start', containerId]);
            await sshClient.dispose();
            return container;
        } catch (ex) {
            await sshClient.dispose();
            logger.error(ex);
            throw ex;
        }
    }

    async createContainerNetwork(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            const networkId = await sshClient.exec(this.cmd, parameters);
            logger.info(`Docker container network ${networkId} created.`);
            await sshClient.dispose();
            return networkId;
        } catch (ex) {
            logger.error(ex);
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
            logger.error(ex);
            throw ex;
        }
    }

    async transferDirectory(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            await sshClient.putDirectory(parameters.localDir, parameters.remoteDir);
            await sshClient.dispose();
        } catch (ex) {
            logger.error(ex);
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
            logger.error(ex);
            throw ex;
        }
    }
};