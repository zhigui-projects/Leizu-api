let handler = require('../../src/services/fabric/update-channel');
let config = require('./env-sample');

let org3 = {
    ConsortiumId: '5bf3b483e289cf1cb06b38a1',
    Organizations: [{
        Name: 'org3',
        MspId: 'Org3MSP',
        Type: 0,
        AnchorPeers: [{Host: 'peer-39-106-198-16.org3.example.com', Port: 7051}],
    }]
};

handler.updateAppChannel(org3, 'mychannel', config.config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});