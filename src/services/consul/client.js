/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const axios = require('axios');
const querystring = require('querystring');
const logger = require('../../libraries/log4js');

module.exports = class ConsulClient {

    constructor(host, port) {
        this.client = axios.create({
            baseURL: `http://${host}:${port}/v1`,
            timeout: 3000,
        });
    }

    async querySelf() {
        let result = await this.query('/agent/self', {});
        if (result) {
            return result.Config;
        }
        return null;
    }

    async putService(options) {
        logger.info('register services:', options);
        let result = await this.put('/catalog/register', options);
        if (result) {
            return true;
        } else {
            return false;
        }
    }

    async put(url, options) {
        try {
            const res = await this.client.put(`${url}`, options);
            if (res.status === 200) {
                return true;
            }
        } catch (err) {
            logger.error(err);
        }
        return null;
    }

    async query(url, options) {
        try {
            const res = await this.client.get(`${url}?${querystring.stringify(options)}`);
            if (res.data) {
                return res.data;
            }
        } catch (err) {
            logger.error(err);
        }
        return null;
    }
};