const mongoose = require('mongoose')
const ordererSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  location: String,
  server_crt_path: String,
  client_cert_path: String,
  client_key_path: String,
  org_id: mongoose.Schema.ObjectId,
  date: Date
});

module.exports = mongoose.model('Orderer',ordererSchema);