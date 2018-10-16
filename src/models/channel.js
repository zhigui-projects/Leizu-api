'use strict';

const mongoose = require('mongoose');
const channelSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    peers: [mongoose.Schema.ObjectId],
    orgs: [mongoose.Schema.ObjectId],
    consortium_id: mongoose.Schema.ObjectId,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Channel', channelSchema, 'channel');