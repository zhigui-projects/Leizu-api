/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

const stringUtil = require('../src/libraries/string-util');

const password = 'pasw0rd';

var hashedPassword = stringUtil.generatePasswordHash(password);

console.log(hashedPassword);
