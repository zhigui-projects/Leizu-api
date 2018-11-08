'use strict';

const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema({
    uuid: String,
    serviceName: String,
    version: String,
    serviceType: Number,
    ledgerDB: String,
    consensusType: String,
    kafka: Array,
    zookeeper: Array,
    organizations: Array,
    channel: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Request', requestSchema, 'request');