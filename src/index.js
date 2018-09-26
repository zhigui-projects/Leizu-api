const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const errorHandler = require('./libraries/error_handler')
const cors = require('koa-cors')
const config = require('./env')

const app = new Koa();

// enable cors
app.use(cors());

// error handler
app.use(errorHandler);

// validator
require('koa-validate')(app);

// set routes
var appDirectory = path.join(__dirname,"app");
fs.readdirSync(appDirectory).filter(file => fs.statSync(path.join(appDirectory, file)).isDirectory()).map((moduleName) => {
  fs.readdirSync(`${appDirectory}/${moduleName}`).filter(file => fs.statSync(path.join(`${appDirectory}/${moduleName}`, file)).isFile()).map((route) => {
    app.use(require(`${appDirectory}/${moduleName}/${route}`).routes());
  })
});

app.port = config.server.port;

module.exports = app;
