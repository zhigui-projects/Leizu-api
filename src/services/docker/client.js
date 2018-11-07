"use strict";

const util = require('util');

const DockerProvider = require('./docker-provider');
const SSHProvider = require('./ssh-provider');

module.exports = class DockerClient {

    constructor(provider) {
        this.provider = provider;
    }

    static getInstance(options) {
        let defaults = {mode:module.exports.MODES.SSH};
        this.options = util._extend(defaults,options);
        let provider = null;
        switch (this.options.mode){
            case module.exports.MODES.DOCKER:
                provider = new DockerProvider(this.options);
            case module.exports.MODES.SSH:
                provider = new SSHProvider(this.options);
            default:
                provider = new SSHProvider(this.options);
        }

        return new DockerClient(provider);
    }

    async createContainer(options) {
        return await this.provider.createContainer(options);
    }
};

module.exports.MODES = {
    DOCKER: "docker",
    SSH: "ssh"
};