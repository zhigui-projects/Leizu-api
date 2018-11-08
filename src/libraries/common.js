'use strict';

//constant variables
module.exports.SUCCESS = 'success';
module.exports.ERROR = 'error';
module.exports.SYNC_SUCCESS = 'synchronize successfully';

module.exports.SEPARATOR_DOT = '.';
module.exports.SEPARATOR_HYPHEN = '-';
module.exports.SEPARATOR_COLON = ':';

module.exports.CONSENSUS_SOLO = 'solo';
module.exports.CONSENSUS_SOLO_VALUE = 0;
module.exports.CONSENSUS_KAFKE = 'kafka';
module.exports.CONSENSUS_KAFKA_VALUE = 1;

module.exports.BOOTSTRAPUSER = {
    enrollmentID: 'admin',
    enrollmentSecret: 'adminpw'
};

module.exports.ADMINUSER = {
    enrollmentID: 'admin-user',
    enrollmentSecret: 'passw0rd'
};

module.exports.PROTOCOL_HTTP = 'http';
module.exports.PROTOCOL_HTTPS = 'https';

module.exports.MODES = {
    DOCKER: 'docker',
    SSH: 'ssh'
};
module.exports.PEER_HOME = '/opt/gopath/src/github.com/hyperledger/fabric/peer';
module.exports.PEER_TYPE_ORDER = 1;
module.exports.PEER_TYPE_PEER = 0;

module.exports.PORT_CA = 7054;
module.exports.PORT_ORDERER = 7050;
module.exports.PORT_PEER = 7051;

module.exports.success = (data, msg) => {
    return {
        code: 200,
        status: exports.SUCCESS,
        data: data,
        msg: msg
    };
};

module.exports.error = (data, msg) => {
    return {
        code: 400,
        status: exports.ERROR,
        data: data,
        msg: msg
    };
};

module.exports.errorWithCode = (data, msg, code) => {
    return {
        code: code,
        status: exports.ERROR,
        data: data,
        msg: msg
    };
};