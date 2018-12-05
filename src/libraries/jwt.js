/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

const config = require('../env').jwt;
const jwt = require('jsonwebtoken');

exports.encode = user => jwt.sign({
    id: user.id,
}, config.secret, {
    expiresIn: config.expiresIn,
});

exports.decode = token => jwt.decode(token, config.secret);
