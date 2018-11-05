'use strict';

const User = require('../../models/user');
const jwt = require('../../libraries/jwt');
const config = require('../../env').jwt;
const common = require('../../libraries/common');

const {BadRequest} = require('../../libraries/error');
const stringUtil = require('../../libraries/string-util');
const router = require('koa-router')({prefix: '/user'});
const ErrorCode = require('../../libraries/error-code');

router.post('/login', async (ctx) => {
    ctx.checkBody('username').notEmpty('Name field is required').len(4, 50, 'Name length must be between 4 and 50 characters');
    ctx.checkBody('password').notEmpty('Password field is required').len(4, 20, 'Password length must be between 4 and 20 characters');

    if (ctx.errors) throw new BadRequest(ctx.errors);

    const {username, password} = ctx.request.body;
    const {user, code} = await getUser(username, password);
    if (code === ErrorCode.USER_CHECK_USERNAME) {
        ctx.status = 401;
        ctx.body = common.errorWithCode([], 'User not exist', code);
        return;
    } else if (code === ErrorCode.USER_CHECK_PASSWORD) {
        ctx.status = 401;
        ctx.body = common.errorWithCode([], 'Password error', code);
        return;
    }
    const token = jwt.encode({id: user._id});
    await User.findOneAndUpdate({_id: user._id}, {token: token});
    ctx.body = {
        id: user._id,
        username: user.toJSON().username,
        token: token,
    };
});

router.post('/logout', async (ctx) => {
    const token = ctx.request.headers['authorization'];
    try {
        const decoded = jwt.decode(token.split(' ')[1], config.secret);
        await User.findOneAndUpdate({_id: decoded.id,}, {token: ''}, {new: true});
        ctx.body = common.success(null, 'User logged out');
    } catch (err) {
        ctx.status = 400;
        ctx.body = common.error(null, err.message);
    }
});

router.post('/password/reset', async (ctx) => {
    const {username, password, newPassword} = ctx.request.body;
    const {user, code} = await getUser(username, password);
    if (code === ErrorCode.USER_CHECK_USERNAME) {
        ctx.status = 401;
        ctx.body = common.errorWithCode([], 'User not exist', code);
        return;
    } else if (code === ErrorCode.USER_CHECK_PASSWORD) {
        ctx.status = 401;
        ctx.body = common.errorWithCode([], 'Password error', code);
        return;
    }
    const newUser = await User.findOneAndUpdate({_id: user._id}, {password: stringUtil.generatePasswordHash(newPassword)}, {new: true});
    ctx.body = {
        id: newUser._id,
        username: newUser.toJSON().username
    };
});

router.get('/check', async (ctx) => {
    if (ctx.currentUser) {
        ctx.body = {username: ctx.currentUser.username};
    }
});

const getUser = async (username, password) => {
    const user = await User.findOne({username: username});
    let code = ErrorCode.SUCCESS_CODE;
    if (!user) {
        code = ErrorCode.USER_CHECK_USERNAME;
        return {code, user};
    }
    if (user.password !== stringUtil.generatePasswordHash(password)) {
        code = ErrorCode.USER_CHECK_PASSWORD;
        return {code, user};
    }

    return {code, user};
};


module.exports = router;
