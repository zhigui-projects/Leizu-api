'use strict';

const Joi = require('joi');

//TODO: need to confirm
module.exports.createConsortium = Joi.object().keys({
    name: Joi.string().min(4).max(255).required(),
}).unknown(true);
