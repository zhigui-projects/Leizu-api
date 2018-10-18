'use strict';

const axios = require('axios');
const logger = require('../../libraries/log4js');
const querystring = require('querystring');

module.exports = class PrometheusClient {

    constructor() {
        this.client = axios.create({
            baseURL: `${process.env.PROMETHEUS_URI}/api/v1`,
            timeout: 3000,
        });
    }

    async queryCpuUsage() {
        const options = {
            query: '(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[1m])) by(instance)) * 100'
        };
        return await this.query(options);
    }

    async queryMemoryUsage() {
        const options = {
            query: '(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100'
        };
        return await this.query(options);
    }

    async query(options) {
        try {
            const res = await this.client.get(`/query?${querystring.stringify(options)}`);
            if (res.status === 'success') {
                return res.data.result;
            }
        } catch (err) {
            logger.error(err);
        }
        return [];
    }
};