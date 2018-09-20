const router = require('koa-router')();
const User = require('../../models/user');
const {
  BadRequest,
} = require('../../libraries/error');


/**
 * @api {get} /user/:user_id Get User Profile
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiName GetUserProfile
 * @apiSampleRequest /user/:user_id
 */
router.get('/user/:user_id', async (ctx) => {
  ctx.checkParams('user_id').notEmpty('User id is required').isInt('User id must be a number');

  if (ctx.errors) throw new BadRequest(ctx.errors);

  const user = await User.findProfileById(ctx.params.user_id);
  if (user) {
    ctx.userProfile = user;
  } else {
    throw new BadRequest([{
      user_id: 'Invalid user id',
    }]);
  }

  ctx.body = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    user_name: user.user_name,
    country: user.country,
  };
});

module.exports = router;
