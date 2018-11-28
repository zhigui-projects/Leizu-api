'use strict';

const Joi = require('joi');
const Common = require('../../common');

const serverchema = {
    name: Joi.string().required(),
    ip: Joi.string().ip().required(),
    ssh_username: Joi.string().required(),
    ssh_password: Joi.string().required()
};

const orgSchema = {
    name: Joi.string().required(),
    ca: Joi.object().keys(serverchema).required()
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
    kafka: Joi.array().items(Joi.object().keys(serverchema)).when('consensus', consensusCondition),
    zookeeper: Joi.array().items(Joi.object().keys(serverchema)).when('consensus', consensusCondition),
    ordererOrg: Joi.object().keys(Object.assign({
        orderer: Joi.array().min(1).items(Joi.object().keys(serverchema)).required()
    }, orgSchema)).required(),
    peerOrgs: Joi.array().min(1).items(Object.assign({
        peers: Joi.array().min(1).items(Joi.object().keys(serverchema)).required()
    }, orgSchema)).required(),
    channel: Joi.object().keys({
        name: Joi.string().required(),
        orgs: Joi.array().min(1).unique().items(Joi.string()).required()
    }).required()
});