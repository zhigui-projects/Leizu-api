'use strict';

const NodeSSH = require('node-ssh');
const AbstractSSH = require('./ssh');
const logger = require('log4js').getLogger('SSHClient');

module.exports = class SSHClient extends AbstractSSH {

    constructor(options) {
        super(options);
        this.cmd = options.cmd || 'docker';
    }

    static getInstance(options) {
        return new SSHClient(options);
    }

    async createContainer(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            let containerId = await sshClient.exec(this.cmd, parameters);
            return await sshClient.exec(this.cmd, ['start', containerId]);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        } finally {
            await sshClient.dispose();
        }
    }

    async createContainerNetwork(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            const networkId = await sshClient.exec(this.cmd, parameters);
            logger.info(`Docker container network ${networkId} created.`);
            return networkId;
        } catch (ex) {
            if (ex.message.includes(`network with name ${parameters[parameters.length - 1]} already exists`)) {
                logger.warn(ex.message);
            } else {
                logger.error(ex);
                throw ex;
            }
        } finally {
            await sshClient.dispose();
        }
    }

    async transferFile(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            await sshClient.putFile(parameters.local, parameters.remote);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        } finally {
            await sshClient.dispose();
        }
    }

    async transferDirectory(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            await sshClient.putDirectory(parameters.localDir, parameters.remoteDir);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        } finally {
            await sshClient.dispose();
        }
    }

    async exec(parameters) {
        let sshClient = new NodeSSH();
        try {
            await sshClient.connect(this.options);
            await sshClient.exec(this.cmd, parameters);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        } finally {
            await sshClient.dispose();
        }
    }
};
