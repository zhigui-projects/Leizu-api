/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');

const objectId = Joi.string().length(24).required();
const string = Joi.string().required();
const hostname = Joi.string().hostname().required();
const port = Joi.number().port();
const ip = Joi.string().ip().required();
const unRequiredObjectId= Joi.string().length(24);

module.exports = {
    objectId,
    string,
    hostname,
    port,
    ip,
    unRequiredObjectId
};
