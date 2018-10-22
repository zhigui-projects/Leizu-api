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
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Consortium', consortiumSchema, 'consortium');