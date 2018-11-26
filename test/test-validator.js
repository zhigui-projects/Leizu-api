'use strict';
const validator = require('../src/libraries/validator/validator');
const Joi = require('joi');

const schema = Joi.object().options({abortEarly: true}).keys({
    email: Joi.string().email().required().label('User Email'),
    password: Joi.string().min(8).required(),
    password_confirmation: Joi.any().valid(Joi.ref('password')).required().options({language: {any: {allowOnly: 'must match password'}}}).label('Password Confirmation'),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company: Joi.string().optional()
});
const data = {
    email: 'not_a_valid_email_to_show_custom_label@qq.com',
    password: 'abc123sss',
    password_confirmation: 'abc123sss',
    first_name: 'Joe',
    last_name: 'Doe'
};
let res = validator.JoiValidate('test', data, schema);
console.log(res);