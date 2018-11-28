'use strict';

const Joi = require('joi');
const Common = require('../../common');

const hostSchema = {
    host: Joi.string().hostname().required(),
    port: Joi.number().port().required()
};

module.exports.newOrdererSchema = Joi.object().keys({
    image: Joi.string().required(),
    host: Joi.string().ip().required(),
    port: Joi.number().port().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    organizationId: Joi.string().required(),
    options: Joi.object().keys({
        peerOrgs: Joi.array().min(1).items(Joi.object().keys({
            name: Joi.string().required(),
            mspId: Joi.string().required(),
            anchorPeer: Joi.object().keys(hostSchema).required()
        })).required(),
        ordererType: Joi.string().valid(Common.CONSENSUS_LIST).required(),
        kafka: Joi.array().min(1).items(Joi.object().keys(hostSchema)).when('ordererType', {
            is: Common.CONSENSUS_KAFKA,
            then: Joi.required()
        })
    }).required()
});