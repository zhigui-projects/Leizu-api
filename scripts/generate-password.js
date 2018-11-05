#!/usr/bin/env node

const stringUtil = require('../src/libraries/string-util');

const password = 'pasw0rd';

var hashedPassword = stringUtil.generatePasswordHash(password);

console.log(hashedPassword);