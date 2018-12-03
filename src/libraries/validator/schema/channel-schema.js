'use strict';

const Joi = require('joi');
const {objectId, string, unRequiredObjectId} = require('./schema-utils');

module.exports.createChannel = Joi.object().keys({
    organizationIds: Joi.array().min(1).items(objectId).required(),
    name: string,
});

module.exports.joinChannel = Joi.object().keys({
    organizationId: objectId,
    channelId: objectId,
    peers: Joi.array().min(1).items(objectId),
});

module.exports.updateChannel = Joi.object().keys({
    organizationId: objectId,
    channelId: unRequiredObjectId,
    channelType: Joi.number().valid([0, 1]),
}).nand(['channelId', 'channelType']);
