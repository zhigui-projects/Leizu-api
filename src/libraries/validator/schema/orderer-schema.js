'use strict';

const Joi = require('joi');
const {objectId, string, hostname, port, ip} = require('./schema-utils');
const Common = require('../../common');
const config = require('../../../env');

const hostSchema = {
    host: hostname,
    port: port
};

module.exports.newOrdererSchema = Joi.object().keys({
    image: Joi.string().valid(config.network.orderer.availableImages),
    host: ip,
    port: port,
    username: string,
    password: string,
    organizationId: objectId,
    options: Joi.object().keys({
        peerOrgs: Joi.array().min(1).items(Joi.object().keys({
            name: string,
            mspId: string,
            anchorPeer: Joi.object().keys(hostSchema).required()
        })).required(),
        ordererType: Joi.string().valid(Common.CONSENSUS_LIST).required(),
        kafka: Joi.array().min(1).items(Joi.object().keys(hostSchema)).when('ordererType', {
            is: Common.CONSENSUS_KAFKA,
            then: Joi.required()
        })
    }).required()
});
