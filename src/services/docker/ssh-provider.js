"use strict";

const logger = require('../../libraries/log4js');
const Client = require('../ssh/client');

module.exports = class SshProvider {

    constructor(connectOptions) {
        this.ssh = new Client(connectOptions);
    }

    static getInstance(connectOptions) {
        return new SshProvider(connectOptions);
    }

    async createContainer(options) {
        try {
            this.ssh.createContainer(options);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};