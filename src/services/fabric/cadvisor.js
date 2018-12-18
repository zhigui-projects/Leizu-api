/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Client = require('../transport/client');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const config = require('../../env');
const consulClient = require('../../services/consul/client');

module.exports = class CAdvisorService {

    static async create(params) {
        const {username, password, host, port} = params;
        const cAdvisorName = `cadivisor-${host.replace(/\./g, '-')}`;
        const consulName = `consul-${host.replace(/\./g, '-')}`;
        let cAdvisorPort = common.PORT.CADVISOR;

        let containerOptions = {
            image: config.network.cadvisor.availableImages[0],
            cAdvisorName,
            port: cAdvisorPort,
        };
        let connectionOptions = {
            host: host,
            username: username,
            password: password,
            port: port || config.ssh.port
        };

        const client = Client.getInstance(connectionOptions);
        const parameters = utils.generateCadvisorContainerOptions(containerOptions);
        const container = await client.createContainer(parameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${cAdvisorPort}`);
        if (!container) {
            throw new Error('create peer failed');
        }

        let consulOptions = {
            image: config.network.consul.availableImages[0],
            consulName,
            host: host,
            consulServer: process.env.PROMETHEUS_HOST || config.prometheus.host
        };
        let consulPort = common.PORT.CONSUL_PORT;
        const consulParameters = utils.generateConsulContainerOptions(consulOptions);
        const consulContainer = await client.createContainer(consulParameters);
        await utils.wait(`${common.PROTOCOL.TCP}:${host}:${consulPort}`);
        if (!consulContainer) {
            throw new Error('create peer failed');
        } else {
            await this.registerService(params);
            return true;
        }
    }

    static async registerService(params) {
        let client = new consulClient(params.host, common.PORT.CONSUL_PORT);
        let result = await client.querySelf();
        let options = {
            Datacenter: result.Datacenter,
            Node: result.NodeID,
            Address: params.host,
            TaggedAddresses: {
                lan: params.host,
                wan: params.host
            },
            Service: {
                Service: common.CADVISOR_SERVICE_NAME,
                Address: params.host,
                Port: common.PORT.CADVISOR
            }
        };
        let res = await client.putService(options);
        if (!res) {
            throw new Error('service register failed');
        }
    }

};
