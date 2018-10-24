let handler = require('../../src/services/fabric/join-channel');
let config = require('./env-dev');

handler.joinChannel('mychannel', config.config, [{
    mspid: 'org1MSP',
    url: 'grpcs://47.94.200.47:7051',
    'server-hostname': 'peer1-org1'
}]).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});