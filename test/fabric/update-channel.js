let handler = require('../../src/services/fabric/update-channel');
let config = require('./env-dev');

handler.updateChannel('org3', 'mychannel', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});