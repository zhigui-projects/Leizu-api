/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('mongoose');
const peerSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    location: String,
    type: {
        type: Number,
        default: 0
    },
    consortium_id: mongoose.Schema.ObjectId,
    org_id: mongoose.Schema.ObjectId,
    sign_key: String,
    sign_cert: String,
    tls_key: String,
    tls_cert: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Peer', peerSchema, 'peer');