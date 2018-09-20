const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../env').jwt;
const { Unauthorized } = require('../libraries/error');

module.exports = async (ctx, next) => {
  const { header: { token } } = ctx;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.secret);
      const user = await User.findOne({
        id: decoded.id,
      });

      if (user && user.id) {
        ctx.currentUser = user;
        await next();
      } else {
        throw new Unauthorized('Missing User');
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Unauthorized('Token Expired');
      } else if (err.name === 'JsonWebTokenError') {
        throw new Unauthorized('Invalid Token');
      } else {
        throw err;
      }
    }
  } else {
    throw new Unauthorized('Missing Auth Token');
  }
};
