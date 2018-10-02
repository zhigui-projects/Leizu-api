'use strict';

module.exports.success = (data,msg) => {
    return {
        code: 200,
        status: "success",
        data: data,
        msg: msg
    };
}

module.exports.error = (data,msg) => {
    return {
        code: 400,
        status: "error",
        data: data,
        msg: msg
    };
}