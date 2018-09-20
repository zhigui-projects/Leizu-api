const knex = require('../libraries/knex');

exports.findOne = where => knex('tb_country')
  .select('tb_country.*')
  .where(where)
  .first();

exports.getList = () => knex('tb_country').select('tb_country.*');
