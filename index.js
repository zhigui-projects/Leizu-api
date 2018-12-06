/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

require('dotenv').config();
const http = require('http');
const app = require('./src');
const port = 8080;

http.createServer(app.callback()).listen(port, () => {
    console.log('API listening on port ' + port);
});
