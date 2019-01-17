/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('mongoose');
const recommendationSchema = new mongoose.Schema({
    uuid: String,
    msp_name: String,
    msp_id: String,
    ca_cert: String,
    admin_cert: String,
    tls_cert: String,
    anchor_peers: [String],
    org_id: mongoose.Schema.ObjectId,
    consortium: String,
    channel: String,
    status: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expiredAt: Date
});

module.exports = mongoose.model('Recommendation', recommendationSchema, 'recommendation');