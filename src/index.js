const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const errorHandler = require('./libraries/error_handler')
const cors = require('koa-cors')
const config = require('./env')

const app = new Koa();

// enable cors
app.use(cors());

// static files
app.use(require('koa-static')('./public'));

// request parameters parser
app.use(require('koa-body')({
  formidable: {
    uploadDir: `${__dirname}/public/uploads`, // This is where the files will be uploaded
    keepExtensions: true
  },
  multipart: true,
  urlencoded: true,
}));

// error handler
app.use(errorHandler);

// validator
require('koa-validate')(app);

// set routes
fs.readdirSync('./app').filter(file => fs.statSync(path.join('./app', file)).isDirectory()).map((moduleName) => {
  fs.readdirSync(`./app/${moduleName}`).filter(file => fs.statSync(path.join(`./app/${moduleName}`, file)).isFile()).map((route) => {
    app.use(require(`./app/${moduleName}/${route}`).routes());
  })
});

app.listen(config.server.port, () => {
  console.log(`API listening on port ${config.server.port}`)
})
