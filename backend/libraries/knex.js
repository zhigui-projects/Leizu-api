const config = require('../env').knex;
const connection = require('knex')(config);

module.exports = connection;
