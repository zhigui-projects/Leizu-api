'use strict';

//constant variables
module.exports.SUCCESS = "success";
module.exports.ERROR = "error";

module.exports.success = (data,msg) => {
    return {
        code: 200,
        status: exports.SUCCESS,
        data: data,
        msg: msg
    };
}

module.exports.error = (data,msg) => {
    return {
        code: 400,
        status: exports.ERROR,
        data: data,
        msg: msg
    };
}