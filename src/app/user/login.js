'use strict';

const router = require('koa-router')();
const User = require('../../models/user');
const jwt = require('../../libraries/jwt');

const { BadRequest, Unauthorized } = require('../../libraries/error');
const string = require('../../libraries/string');

router.post('/login', async (ctx) => {
  ctx.checkBody('name').notEmpty('Name field is required').len(4, 50, 'Name length must be between 4 and 50 characters');
  ctx.checkBody('password').notEmpty('Password field is required').len(4, 20, 'Password length must be between 4 and 20 characters');

  if (ctx.errors) throw new BadRequest(ctx.errors);

  const user = await User.findOne({
    name: ctx.request.body.name,
    password: string.generatePasswordHash(ctx.request.body.password),
  });

  if (!user) throw new Unauthorized('Invalid Credentials');
  
  ctx.body = {
    id: user._id,
    name: user.name,
    token: jwt.encode({ id: user._id }),
  };
});

module.exports = router;
