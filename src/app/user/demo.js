'use strict';

const router = require('koa-router')();

router.get('/', async (ctx) => {
    ctx.body = 'welcome to ledger dashboard!';
});
router.get('/demo', async (ctx) => {
    ctx.response.type = 'json';
    ctx.body = {code: 200, status: 'success', msg: 'hello world'};
});

module.exports = router;
