const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../env').jwt;
const {Unauthorized} = require('../libraries/error');

module.exports = async (ctx, next) => {
    const bearerToken = ctx.request.headers['authorization'];
    const requestFrom = ctx.request.headers['x-request-from'];

    if (requestFrom === 'BaaS') {
        await next();
    } else if (bearerToken) {
        try {
            const token = bearerToken.split(' ')[1];
            const decoded = jwt.verify(token, config.secret);
            const user = await User.findOne({_id: decoded.id});

            if (user && token === user.toJSON().token) {
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
