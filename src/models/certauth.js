"use strict";

const mongoose = require("mongoose");
const certificateAuthoritySchema = new mongoose.Schema({
    uuid: String,
    name: String,
    is_root: Boolean,
    parent_id: mongoose.Schema.ObjectId,
    date: Date
});

module.exports = mongoose.model("CertAuth", certificateAuthoritySchema);