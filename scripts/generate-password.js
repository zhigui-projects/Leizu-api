/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

const stringUtil = require('../src/libraries/string-util');

const password = 'passw0rd';

const hashedPassword = stringUtil.generatePasswordHash(password);

console.log(hashedPassword);
