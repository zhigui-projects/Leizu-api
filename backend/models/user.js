const knex = require('../libraries/knex');

exports.findOne = where => knex('tb_user')
  .select('tb_user.*')
  .where(where)
  .first();

exports.findProfileById = id => knex('tb_user')
  .select('tb_user.*', knex.raw('row_to_json(tb_country) as country'))
  .leftJoin('tb_country', 'tb_country.id', '=', 'tb_user.country_id')
  .where('tb_user.id', id)
  .first();

exports.getList = () => knex('tb_user').select('tb_user.*');

exports.count = () => knex('tb_user').count().first();
