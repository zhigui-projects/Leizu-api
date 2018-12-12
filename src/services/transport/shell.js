/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const shell = require('shelljs');
const escape = require('shell-escape');
const BaseClient = require('./base');
const logger = require('log4js').getLogger('ShellClient');

module.exports = class ShellClient extends BaseClient {

    constructor(options) {
        super(options);
        this.cmd = options.cmd || 'docker';
        shell.config.silent = true;
    }

    static getInstance(options) {
        return new ShellClient(options);
    }

    async createContainer(parameters) {
        try {
            let containerId = await this.exec(parameters);
            return this.exec(['start', containerId]);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        }
    }

    async createContainerNetwork(parameters) {
        try {
            const networkId = this.exec(parameters);
            logger.info(`Docker container network ${networkId} created.`);
            return networkId;
        } catch (ex) {
            if (ex.message.includes(`network with name ${parameters[parameters.length - 1]} already exists`)) {
                logger.warn(ex.message);
            } else {
                logger.error(ex);
                throw ex;
            }
        }
    }

    async transferFile(parameters) {
        try {
            const remote = parameters.remote;
            shell.mkdir('-p', remote.substr(0, remote.lastIndexOf('/')));
            shell.cp(parameters.local, remote);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        }
    }

    async transferDirectory(parameters) {
        try {
            shell.cp('-R', parameters.localDir, parameters.remoteDir);
        } catch (ex) {
            logger.error(ex);
            throw ex;
        }
    }

    async exec(parameters) {
        try {
            return shell.exec(this.buildCommand(parameters)).stdout.trim();
        } catch (ex) {
            logger.error(ex);
            throw ex;
        }
    }

    buildCommand(parameters = []) {
        const command = [this.cmd].concat(escape(parameters)).join(' ');
        logger.debug('The full command to be run: %s', command);
        return command;
    }
};
