let handler = require('../../src/services/fabric/create-channel');
let config = require('./env-sample');

handler.createChannel(config.config.channelCreateTx, 'mychannel', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});