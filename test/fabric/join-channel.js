let handler = require('../../src/services/fabric/join-channel');
let config = require('./env-sample');

handler.joinChannel('mychannel', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});
