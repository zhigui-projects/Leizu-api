"use strict";

module.exports = class DockerClient {
    constructor(provider) {
        this.provider = provider;
    }

    static getInstance(provider) {
        return new DockerClient(provider);
    }

    async createContainer(options) {
        return await this.provider.createContainer(options);
    }
};