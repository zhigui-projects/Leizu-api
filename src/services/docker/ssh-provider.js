'use strict';

const logger = require('../../libraries/log4js');
const Client = require('../ssh/client');

module.exports = class SshProvider {

    constructor(connectOptions) {
        this.ssh = new Client(connectOptions);
    }

    static getInstance(connectOptions) {
        return new SshProvider(connectOptions);
    }

    async createContainer(parameters) {
        try {
            return await this.ssh.createContainer(parameters);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async transferFile(parameters) {
        try {
            await this.ssh.transferFile(parameters);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async transferDirectory(parameters) {
        try {
            await this.ssh.transferDirectory(parameters);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    async exec(parameters) {
        try {
            await this.ssh.exec(parameters);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};
