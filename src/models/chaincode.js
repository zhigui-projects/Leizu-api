/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('mongoose');
const chaincodeSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    path: String,
    version: String,
    type: String,
    peers: [mongoose.Schema.ObjectId],
    state: {
        type: Number,
        default: 0
    },
    channel_id: mongoose.Schema.ObjectId,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Chaincode', chaincodeSchema, 'chaincode');