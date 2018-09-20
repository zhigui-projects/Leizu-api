const router = require('koa-router')();
const User = require('../../models/user');
const jwt = require('../../libraries/jwt');

const { BadRequest, Unauthorized } = require('../../libraries/error');
const string = require('../../libraries/string');


/**
 * @api {post} /login User Login
 * @apiVersion 1.0.0
 * @apiGroup Auth
 * @apiName UserLogin
 * @apiParam {String{1,255}} email user email
 * @apiParam {String{1,20}} password user password
 * @apiSampleRequest /login
 */
router.post('/login', async (ctx) => {
  ctx.checkBody('email').notEmpty('Email field is required').len(4, 50, 'Email length must be between 4 and 50 characters');
  ctx.checkBody('password').notEmpty('Password field is required').len(4, 20, 'Password length must be between 4 and 20 characters');

  if (ctx.errors) throw new BadRequest(ctx.errors);

  const user = await User.findOne({
    email: ctx.request.body.email,
    password: string.generatePasswordHash(ctx.request.body.password),
  });

  if (!user) throw new Unauthorized('Invalid Credentials');

  ctx.body = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    user_name: user.user_name,
    country_id: user.country_id,
    token: jwt.encode({ id: user.id }),
  };
});

module.exports = router;
