const config = require('../env').database;
const connection = require('mongoose').connect(config);

module.exports = connection;
