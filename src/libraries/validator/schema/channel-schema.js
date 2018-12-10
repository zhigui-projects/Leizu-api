/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');
const {objectId, string, unRequiredObjectId} = require('./schema-utils');

module.exports.getChannelList = Joi.object().options({abortEarly: true}).keys({
    consortiumId: objectId
});

module.exports.getChannelDetail = Joi.object().options({abortEarly: true}).keys({
    consortiumId: objectId,
    id: objectId
});

module.exports.createChannel = Joi.object().keys({
    organizationIds: Joi.array().min(1).items(objectId).required().sparse(false),
    name: string,
});

module.exports.joinChannel = Joi.object().keys({
    organizationId: objectId,
    channelId: objectId,
    peers: Joi.array().min(1).items(objectId).sparse(false),
});

module.exports.updateChannel = Joi.object().keys({
    organizationId: objectId,
    channelId: unRequiredObjectId,
    channelType: Joi.number().valid([0, 1]),
}).nand(['channelId', 'channelType']);
