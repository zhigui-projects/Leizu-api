let handler = require('../../src/services/fabric/create-channel');
let config = require('./env-dev');

handler.createChannel('OrgsChannel', 'mychannel', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});