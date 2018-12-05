/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports = class RequestContext {

    constructor(){
        this.map = new Map();
    }

    get(key){
        return this.map.get(key);
    }

    set(key,value){
        this.map.set(key,value);
    }
};