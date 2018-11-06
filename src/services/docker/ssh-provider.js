"use strict";

const plan = require('flightplan');
const logger = require('../../libraries/log4js');

module.exports = class SshProvider {

    constructor(connectOptions) {
        plan.target(connectOptions.name, {
            host: connectOptions.host,
            username: connectOptions.username,
            password: connectOptions.password
        });
    }

    static getInstance(connectOptions) {
        return new SshProvider(connectOptions);
    }

    async createContainer(options) {
        try {
            plan.remote((remote) => {
                // TODO:
            });
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};