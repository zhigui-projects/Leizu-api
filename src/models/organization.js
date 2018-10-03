"use strict";

const mongoose = require('mongoose');
const organizationSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  tls: Boolean,
  msp_id: String,
  consortium_id: mongoose.Schema.ObjectId,
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Organization',organizationSchema,"organization");