const sha1 = require('sha1');

const prefix = '/8Z4{Uj=19uMPRx6Y';

module.exports.generatePasswordHash = password => sha1(prefix + password);

module.exports.getCaName = orgName => 'ca-' + orgName;

module.exports.getUrl = (protocol,ip,port) => protocol + '://' + ip + ":" + port;


