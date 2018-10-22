'use strict';

const axios = require('axios');
const config = require('../../env');
const logger = require('../../libraries/log4js');
const querystring = require('querystring');

module.exports = class PrometheusClient {

    constructor() {
        this.client = axios.create({
            baseURL: `${process.env.PROMETHEUS_URI || config.prometheus.url}/api/v1`,
            timeout: 3000,
        });
    }

    async queryCpuUsage() {
        const options = {
            query: 'sum by(name, instance)(irate(container_cpu_usage_seconds_total{image=~"hyperledger.*"}[1m])) * 100'
        };
        return await this.query(options);
    }

    async queryMemoryUsage() {
        const options = {
            query: '(container_memory_usage_bytes{image=~"hyperledger.*"} / on(instance) group_left machine_memory_bytes) * 100'
        };
        return await this.query(options);
    }

    async query(options) {
        try {
            const res = await this.client.get(`/query?${querystring.stringify(options)}`);
            if (res.data.status === 'success') {
                return res.data.data.result;
            }
        } catch (err) {
            logger.error(err);
        }
        return [];
    }
};