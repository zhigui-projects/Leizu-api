const mongoose = require("mongoose");
const channelSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    peers: [mongoose.Schema.ObjectId],
    orgs: [mongoose.Schema.ObjectId],
    date: Date
});

module.exports = mongoose.model("Channel",channelSchema);