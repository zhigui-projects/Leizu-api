const http = require('http');
const app = require("./src");
const port = 8080;
http.createServer(app.callback()).listen(port);