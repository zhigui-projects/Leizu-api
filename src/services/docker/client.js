"use strict";

const SSHProvider = require('./ssh-provider');

module.exports = class DockerClient {

    constructor(provider) {
        this.provider = provider;
    }

    static getInstance(options) {
        this.options = options;
        let provider = new SSHProvider(this.options);

        return new DockerClient(provider);
    }

    async createContainer(options) {
        return await this.provider.createContainer(options);
    }

    async createContainerNetwork(options) {
        return await this.provider.createContainerNetwork(options);
    }

    async transferFile(parameters) {
        await this.provider.transferFile(parameters);
    }

    async transferDirectory(parameters) {
        await this.provider.transferDirectory(parameters);
    }

    async exec(parameters) {
        await this.provider.exec(parameters);
    }
};
