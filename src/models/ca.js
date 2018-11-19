'use strict';

const mongoose = require('mongoose');
const peerSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    url: String,
    enroll_id: String,
    enroll_secret: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Ca', peerSchema, 'ca');