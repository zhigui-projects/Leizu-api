const db = require("../liraries/db")
const User = new db.Schema({
  name: String,
  type: String
});

module.exports = db.model('User',User);