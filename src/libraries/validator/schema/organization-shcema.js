'use strict';

const Joi = require('joi');

module.exports.newOrganizationSchema = Joi.object().keys({
    name: Joi.string().required(),
    domainName: Joi.string().hostname().required(),
    host: Joi.string().ip().required(),
    port: Joi.number().port().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    consortiumId: Joi.string().required()
});