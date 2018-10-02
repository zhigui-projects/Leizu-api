const mongoose = require('mongoose');
const consortiumSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  network_config: String
});

module.exports = mongoose.model('Consortium',consortiumSchema,'consortium');