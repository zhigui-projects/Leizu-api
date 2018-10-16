'use strict';

const mongoose = require('mongoose');
const peerSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    location: String,
    org_id: mongoose.Schema.ObjectId,
    server_crt_path: String,
    client_cert_path: String,
    client_key_path: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Peer', peerSchema, 'peer');