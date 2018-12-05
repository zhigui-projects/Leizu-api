/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');
const SchemaUtils= require('./schema-utils');

//TODO: need to confirm
module.exports.createConsortium = Joi.object().keys({
    name: Joi.string().min(4).max(255).required(),
}).unknown(true);

module.exports.getConsortium=Joi.object().keys({
    id:SchemaUtils.objectId
}).unknown(true);