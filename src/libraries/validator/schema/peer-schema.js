'use strict';

const Joi = require('joi');
const {objectId, string, ip, port} = require('./schema-utils');

module.exports.newPeerSchema = Joi.object().keys({
    organizationId: objectId,
    peers: Joi.array().min(1).items(Joi.object().keys({
        image: string,
        host: ip,
        port: port,
        username: string,
        password: string
    })).required()
});
