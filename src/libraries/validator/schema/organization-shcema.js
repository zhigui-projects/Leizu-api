/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');
const {objectId, string, hostname, ip, port} = require('./schema-utils');
const common = require('../../common');

const serverSchema = () => {
    if (process.env.RUN_MODE === common.RUN_MODE.REMOTE) {
        return {
            host: ip,
            username: string,
            password: string,
            port: port
        };
    }
    else {
        return {
            host: Joi.string().valid('127.0.0.1').required(),
            username: Joi.any().forbidden(),
            password: Joi.any().forbidden(),
            port: Joi.any().forbidden()
        };
    }
};

module.exports.newOrganizationSchema = Joi.object().keys(Object.assign({
    name: string,
    domainName: hostname,
    consortiumId: objectId
}, serverSchema()));
