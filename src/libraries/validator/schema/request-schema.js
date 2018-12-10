/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Joi = require('joi');
const {string, ip} = require('./schema-utils');
const Common = require('../../common');

const serverSchema = {
    name: string,
    ip: ip,
    ssh_username: string,
    ssh_password: string
};

const orgSchema = {
    name: string,
    ca: Joi.object().keys(serverSchema).required()
};

const consensusCondition = {
    is: Common.CONSENSUS_KAFKA,
    then: Joi.required()
};

module.exports.requestSchema = Joi.object().options({}).keys({
    name: Joi.string().min(4).max(255).required(),
    type: Joi.string().valid(Common.BLOCKCHAIN_TYPE_LIST).required(),
    version: Joi.string().valid(Common.VERSION_LIST).required(),
    db: Joi.string().valid(Common.DB_TYPE_LIST).required(),
    consensus: Joi.string().valid(Common.CONSENSUS_LIST).required(),
    kafka: Joi.array().items(Joi.object().keys(serverSchema)).when('consensus', consensusCondition),
    zookeeper: Joi.array().items(Joi.object().keys(serverSchema)).when('consensus', consensusCondition),
    ordererOrg: Joi.object().keys(Object.assign({
        orderer: Joi.array().min(1).items(Joi.object().keys(serverSchema)).required().sparse(false)
    }, orgSchema)).required(),
    peerOrgs: Joi.array().min(1).items(Object.assign({
        peers: Joi.array().min(1).items(Joi.object().keys(serverSchema)).required().sparse(false)
    }, orgSchema)).required(),
    channel: Joi.object().keys({
        name: string,
        orgs: Joi.array().min(1).unique().items(string).required().sparse(false)
    }).required()
});
