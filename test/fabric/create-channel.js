let handler = require('../../src/services/fabric/create-channel');
let config = require('./env-dev');

handler.createChannel('mychannel-test3', '../../../build/generator/mychannel.tx', config.config)
    .then(result => {
        console.log(result);
    }, err => {
        console.log(err);
    });