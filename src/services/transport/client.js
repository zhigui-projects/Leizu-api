/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const common = require('../../libraries/common');
const SshClient = require('./ssh');
const ShellClient = require('./shell');

module.exports = class TransportClient {

    constructor(client) {
        this.client = client;
    }

    static getInstance(options) {
        let client = null;
        switch (process.env.RUN_MODE) {
        case common.RUN_MODE.REMOTE:
            client = new SshClient(options);
            break;
        case common.RUN_MODE.LOCAL:
            client = new ShellClient(options);
            break;
        default:
            client = new ShellClient(options);
        }

        return new TransportClient(client);
    }

    async createContainer(parameters) {
        return await this.client.createContainer(parameters);
    }

    async createContainerNetwork(parameters) {
        return await this.client.createContainerNetwork(parameters);
    }

    async transferFile(parameters) {
        await this.client.transferFile(parameters);
    }

    async transferDirectory(parameters) {
        await this.client.transferDirectory(parameters);
    }

    async setOptions(parameters){
        await this.client.setOptions(parameters);
    }

    async exec(parameters) {
        await this.client.exec(parameters);
    }
};
