const mongoose = require('mongoose');
const consortiumSchema = new mongoose.Schema({
  uuid: String,
  name: String
});

module.exports = mongoose.model('Consortium',consortiumSchema);