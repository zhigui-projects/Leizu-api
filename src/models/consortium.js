/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('mongoose');
const consortiumSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    type: {
        type: String,
        default: "fabric"
    },
    synced: {
        type: Boolean,
        default: false
    },
    network_config: String,
    request_id: mongoose.Schema.ObjectId,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Consortium', consortiumSchema, 'consortium');