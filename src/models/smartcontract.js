const mongoose = require("mongoose");
const smartContractSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    source: String,
    path: String,
    version: String,
    channel_id: mongoose.Schema.ObjectId,
    date: Date
});

module.exports = mongoose.model("SmartContract",smartContractSchema);