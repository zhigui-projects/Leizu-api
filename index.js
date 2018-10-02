const http = require('http');
const app = require("./src");
const port = 8080;
http.createServer(app.callback()).listen(port,function(){
    console.log("API listening on port " + port);
});