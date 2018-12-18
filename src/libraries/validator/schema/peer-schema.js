/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');
const {objectId, string, ip, port} = require('./schema-utils');
const config = require('../../../env');
const common = require('../../common');

module.exports.newPeerSchema = Joi.object().keys({
    organizationId: objectId,
    peers: Joi.array().min(1).items(Joi.object().keys({
        name: string,
        image: Joi.string().valid(config.network.peer.availableImages),
        host: ip,
        port: port,
        username: string,
        password: string
    })).required()
});

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

module.exports.checkPeerStatusSchema = Joi.object().keys(serverSchema());
