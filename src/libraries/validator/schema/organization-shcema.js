'use strict';

const Joi = require('joi');
const {objectId, string, hostname, ip, port} = require('./schema-utils');

module.exports.newOrganizationSchema = Joi.object().keys({
    name: string,
    domainName: hostname,
    host: ip,
    port: port,
    username: string,
    password: string,
    consortiumId: objectId
});
