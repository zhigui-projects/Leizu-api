const router = require('koa-router')();
const User = require('../../models/user');

router.get('/users', async (ctx) => {
  ctx.body = await User.getList();
});

module.exports = router;
