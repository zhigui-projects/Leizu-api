/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('mongoose');
const ordererSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    location: String,
    sign_key: String,
    sign_cert: String,
    tls_key: String,
    tls_cert: String,
    consortium_id: mongoose.Schema.ObjectId,
    org_id: mongoose.Schema.ObjectId,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Orderer', ordererSchema, 'orderer');