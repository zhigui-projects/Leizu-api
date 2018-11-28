'use strict';
let Joi = require('joi');
const userNameSchema = Joi.string().min(4).max(50).required();
const passwordSchema = Joi.string().min(4).max(20).required();

module.exports.loginSchema = Joi.object().options({abortEarly: false}).keys({
    username: userNameSchema,
    password: passwordSchema,
});

module.exports.resetSchema = Joi.object().options({abortEarly: false}).keys({
    username: userNameSchema,
    password: passwordSchema,
    newPassword: passwordSchema.valid(Joi.ref('password')).options({language: {any: {allowOnly: 'must match password'}}})
});