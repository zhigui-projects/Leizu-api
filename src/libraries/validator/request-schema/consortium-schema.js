'use strict';

const Joi = require('joi');

const objectId = Joi.string().length(24).required();

module.exports.consortiumId = objectId;

//TODO: need to confirm
module.exports.createConsortium = Joi.object().keys({
    name: Joi.string().min(4).max(255).required(),
}).unknown(true);
