"use strict";

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  uuid: String,
  username: String,
  password: String,
  role_id: mongoose.Schema.ObjectId,
  date: Date
});

module.exports = mongoose.model('User',userSchema,"user");