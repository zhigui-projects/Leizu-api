const router = require('koa-router')();
const Country = require('../../models/country');
const auth = require('../../middlewares/auth');

/**
 * @api {get} /countries Get Countries List
 * @apiVersion 1.0.0
 * @apiGroup Country
 * @apiName GetCountriesList
 * @apiHeader {String} token user token
 * @apiSampleRequest /countries
 */
router.get('/countries', auth, async (ctx) => {
  ctx.body = await Country.getList();
});

module.exports = router;
