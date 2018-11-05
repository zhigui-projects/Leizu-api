const sha1 = require('sha1');

const prefix = '/8Z4{Uj=19uMPRx6Y';

module.exports.generatePasswordHash = password => sha1(prefix + password);

module.exports.getCaName = orgName => 'ca-' + orgName;

module.exports.getUrl = (protocol,ip,port) => protocol + '://' + ip + ":" + port;

module.exports.getMspId = orgName => module.exports.capitalize(orgName) + 'MSP';

module.exports.capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}


