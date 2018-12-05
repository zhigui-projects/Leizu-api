/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');
const {objectId, string, ip, port} = require('./schema-utils');
const config = require('../../../env');

module.exports.newPeerSchema = Joi.object().keys({
    organizationId: objectId,
    peers: Joi.array().min(1).items(Joi.object().keys({
        image: Joi.string().valid(config.network.peer.availableImages),
        host: ip,
        port: port,
        username: string,
        password: string
    })).required()
});
