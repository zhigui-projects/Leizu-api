"use strict";

const Docker = require('dockerode');
const logger = require('../../libraries/log4js');

module.exports = class DockerProvider {

    constructor(connectOptions) {
        this.docker = new Docker(connectOptions);
    }

    static getInstance(connectOptions) {
        return new DockerProvider(connectOptions);
    }

    async createContainer(options) {
        try {
            let container = await this.docker.createContainer(options);
            container.start();
            return container;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
};