let handler = require('../../src/services/fabric/join-channel');
let config = require('./env-sample');

handler.joinChannel('mychannel', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});

// handler.joinChannel('mychannel', config.config, [{
//     mspid: 'org3MSP',
//     url: 'grpcs://39.106.149.201:7051',
//     'server-hostname': 'peer1-org3'
// }]).then(result => {
//     console.log(result);
// }, err => {
//     console.log(err);
// });