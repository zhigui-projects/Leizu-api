'use strict';
let Joi = require('joi');

module.exports.loginSchema = Joi.object().options({abortEarly: false}).keys({
    username: Joi.string().min(4).max(50).required(),
    password: Joi.string().min(4).max(20).required(),
});