"use strict";

const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({
  uuid: String,
  name: String
});

module.exports = mongoose.model('Role',roleSchema,'role');