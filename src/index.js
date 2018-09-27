const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const errorHandler = require('./libraries/error_handler');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const config = require('./env');

const app = new Koa();

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

app.port = config.server.port;

module.exports = app;
