let handler = require('../../src/services/fabric/update-channel');
let config = require('./env-dev');

handler.updateChannel(config.updateConfig, 'mychannel-test7', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});