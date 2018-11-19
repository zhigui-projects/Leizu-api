'use strict';

const mongoose = require('mongoose');
const certAuthoritySchema = new mongoose.Schema({
    uuid: String,
    name: String,
    url: String,
    enroll_id: String,
    enroll_secret: String,
    org_id: mongoose.Schema.ObjectId,
    consortium_id: mongoose.Schema.ObjectId,
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('CertAuthority', certAuthoritySchema, 'certauthority');