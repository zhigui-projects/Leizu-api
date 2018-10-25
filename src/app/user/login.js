'use strict';

const User = require('../../models/user');
const jwt = require('../../libraries/jwt');

const {BadRequest, Unauthorized} = require('../../libraries/error');
const string = require('../../libraries/string');
const router = require('koa-router')({prefix: '/user'});

router.post('/login', async (ctx) => {
    ctx.checkBody('name').notEmpty('Name field is required').len(4, 50, 'Name length must be between 4 and 50 characters');
    ctx.checkBody('password').notEmpty('Password field is required').len(4, 20, 'Password length must be between 4 and 20 characters');

    if (ctx.errors) throw new BadRequest(ctx.errors);

    const {name, password} = ctx.request.body;
    const user = await getUser(name, password);

    ctx.body = {
        id: user._id,
        name: user.toJSON().name,
        token: jwt.encode({id: user._id}),
    };
});

router.post('/password/reset', async (ctx) => {
    const {name, password, newPassword} = ctx.request.body;
    const user = await getUser(name, password);
    const newUser = await User.findOneAndUpdate(user._id, {password: string.generatePasswordHash(newPassword)}, {new: true});

    ctx.body = {
        id: newUser._id,
        name: newUser.toJSON().name
    };
});

const getUser = async (username, password) => {
    const user = await User.findOne({
        name: username,
        password: string.generatePasswordHash(password),
    });

    if (!user) throw new Unauthorized('Invalid Credentials');

    return user;
};


module.exports = router;
