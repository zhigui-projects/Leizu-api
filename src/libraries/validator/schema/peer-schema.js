'use strict';

const Joi = require('joi');

module.exports.newPeerSchema = Joi.object().keys({
    organizationId: Joi.string().required(),
    peers: Joi.array().min(1).items(Joi.object().keys({
        image: Joi.string().required(),
        host: Joi.string().ip().required(),
        port: Joi.number().port().required(),
        username: Joi.string().required(),
        password: Joi.string().required()
    })).required()
});