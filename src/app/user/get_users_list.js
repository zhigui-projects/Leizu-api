const router = require('koa-router')();
const User = require('../../models/user');

router.get('/users', async (ctx) => {
  ctx.body = await User.getList();
});

router.get("/demo",async (ctx) =>{
    ctx.body = {code:200,status:"success",msg:"hello world"};
});

module.exports = router;
