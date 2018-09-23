const mongoose = require('mongoose')
const organizationSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  tls: Boolean,
  msp_id: String,
  league_id: mongoose.Schema.ObjectId,
  date: Date
});

module.exports = mongoose.model('Organization',organizationSchema);