/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('mongoose');
const confUptSchema = new mongoose.Schema({
    uuid: String,
    editedConf: Buffer,
    editedConfHash: String,
    collectedSigs: [String],
    status: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('ConfUpt', confUptSchema, 'confUpt');