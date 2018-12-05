/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const fs = require('fs');
const path = require('path');
const compose = require('koa-compose');

const getDirs = (pluginPath) => {
    return fs.readdirSync(pluginPath).filter(file => {
        return fs.statSync(path.join(pluginPath, file)).isDirectory();
    });
};

module.exports = (pluginPath, filename = 'index.js') => {
    let plugins = {};
    let dirs = getDirs(pluginPath);
    let list = [];

    for (let name of dirs) {
        let fn = require(path.join(pluginPath, name, filename));

        if (typeof fn !== 'function' && typeof fn.default === 'function') {
            fn = fn.default;
        } else {
            throw (new Error('plugin must be a function!'));
        }

        plugins[name] = fn;

        list.push((ctx, next) => {
            return fn(ctx, next) || next();
        });
    }

    return compose(list);
};