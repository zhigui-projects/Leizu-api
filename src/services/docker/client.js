"use strict";

const util = require('../../libraries/utils');
const common = require('../../libraries/common');

const DockerProvider = require('./docker-provider');
const SSHProvider = require('./ssh-provider');

module.exports = class DockerClient {

    constructor(provider) {
        this.provider = provider;
    }

    static getInstance(options) {
        let defaults = {mode: common.MODES.SSH};
        this.options = util.extend(defaults, options);
        let provider = null;
        switch (this.options.mode) {
            case common.MODES.DOCKER:
                provider = new DockerProvider(this.options);
                break;
            case common.MODES.SSH:
                provider = new SSHProvider(this.options);
                break;
            default:
                provider = new SSHProvider(this.options);
        }

        return new DockerClient(provider);
    }

    async createContainer(options) {
        return await this.provider.createContainer(options);
    }

    async transferFile(parameters) {
        await this.provider.transferFile(parameters);
    }

    async exec(parameters) {
        await this.provider.exec(parameters);
    }
};
