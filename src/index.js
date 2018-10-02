const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const errorHandler = require('./libraries/error_handler');
const config = require('./env');

const app = new Koa();
app.config = config;
app.mongoose = require("./libraries/db");
if(config.koaLogger){
    const logger = require("koa-logger");
    app.use(logger());
}

app.use(cors());
app.use(errorHandler);
app.use(bodyParser());

// validator
require('koa-validate')(app);

// set routes
const appDirectory = path.join(__dirname, "app");
fs.readdirSync(appDirectory)
    .filter(file => fs.statSync(path.join(appDirectory, file)).isDirectory())
    .forEach((moduleName) => {
        fs.readdirSync(`${appDirectory}/${moduleName}`)
            .filter(file => fs.statSync(path.join(`${appDirectory}/${moduleName}`, file)).isFile())
            .forEach((route) => {
                app.use(require(`${appDirectory}/${moduleName}/${route}`).routes());
            })
    });

module.exports = app;
