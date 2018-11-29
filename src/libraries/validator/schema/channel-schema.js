'use strict';

const Joi = require('joi');

const objectId = Joi.string().length(24).required();

module.exports.createChannel = Joi.object().keys({
    organizationIds: Joi.array().min(1).items(objectId).required(),
    name: Joi.string().required(),
});

module.exports.joinChannel = Joi.object().keys({
    organizationId: objectId,
    channelId: objectId,
    peers: Joi.array().min(1).items(objectId),
});

module.exports.updateChannel = Joi.object().keys({
    organizationId: objectId,
    channelId: objectId,
    channelType: Joi.number().valid([0, 1]).required(),
}).nand(['channelId', 'channelType']);
