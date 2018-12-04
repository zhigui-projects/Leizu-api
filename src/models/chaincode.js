'use strict';

const mongoose = require('mongoose');
const chaincodeSchema = new mongoose.Schema({
    uuid: String,
    chaincode_name: String,
    chaincode_path: String,
    chaincode_version: String,
    chaincode_type: String,
    peers: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Chaincode', chaincodeSchema, 'chaincode');