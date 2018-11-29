'use strict';

const Joi = require('joi');

const objectId = Joi.string().length(24).required();
const string = Joi.string().required();
const hostname = Joi.string().hostname().required();
const port = Joi.number().port().required();
const ip = Joi.string().ip().required();

module.exports = {
    objectId,
    string,
    hostname,
    port,
    ip,
};
