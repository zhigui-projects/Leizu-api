const router = require('koa-router')();
const auth = require('../../middlewares/auth');

const Country = require('../../models/country');

router.get('/me/profile', auth, async (ctx) => {
  const user = ctx.currentUser;
  user.country = await Country.findOne({
    id: user.country_id,
  });

  ctx.body = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    user_name: user.user_name,
    country_id: user.country_id,
    token: user.token,
  };
});

module.exports = router;
