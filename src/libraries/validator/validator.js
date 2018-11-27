'use strict';
let Joi = require('joi');

/**
 * validate object by joi
 * @param position  [string]        [tag about what you validate]
 * @param data      [object]        [data]
 * @param schema    [joiSchema]     [schema object from  libraries/validator/joa-schema]
 * @returns object {result:bool,message:string,errMsg:array}
 * schema example link https://github.com/hapijs/joi/blob/master/README.md
 */
module.exports.JoiValidate = (position, data, schema) => {
    let result = {result: false, message: 'Congratulations', errMsg: []};
    if (typeof data !== 'object' || typeof schema !== 'object') {
        result.message = `${position}: data and schema must be an object`;
        return result;
    }
    const {error} = Joi.validate(data, schema, {
        convert: false
    });
    if (error) {
        if (error.details.length > 1) {
            result.message = `${position}: arguments validation failed`;
            error.details.map(item => {
                const err = {};
                err[item.context.label] = `${position}: ${item.message}`;
                result.errMsg.push(err);
            });
        } else {
            let err = {};
            let detail = error.details[0];
            result.message = `${position}: ${detail.message}`;
            err[detail.context.label] = result.message;
            result.errMsg.push(err);
        }
    } else {
        result.result = true;
    }
    return result;
};