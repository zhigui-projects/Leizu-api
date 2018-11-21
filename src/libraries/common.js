'use strict';

module.exports.SYSTEM_CHANNEL = 'systemchainid';

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
module.exports.CONFIFTX_OUTPUT_GENESIS_BLOCK = 'OrdererGenesis';
module.exports.CONFIFTX_OUTPUT_CHANNEL = 'OrgsChannel';

// REQUEST STATUS SECTION
module.exports.REQUEST_STATUS_PENDING = 'pending';
module.exports.REQUEST_STATUS_RUNNING = 'running';
module.exports.REQUEST_STATUS_SUCCESS = 'success';
module.exports.REQUEST_STATUS_ERROR = 'error';

module.exports.BOOTSTRAPUSER = {
    enrollmentID: 'admin',
    enrollmentSecret: 'adminpw'
};

module.exports.ADMINUSER = {
    enrollmentID: 'admin-user',
    enrollmentSecret: 'passw0rd'
};

module.exports.PROTOCOL = {
    HTTP: 'http',
    HTTPS: 'https',
    TCP: 'tcp',
};

module.exports.MODES = {
    DOCKER: 'docker',
    SSH: 'ssh'
};

module.exports.DEFAULT_NETWORK = {
    NAME: 'fabric_network',
    DRIVER: 'bridge'
};

module.exports.PORT = {
    CA: 7054,
    ORDERER: 7050,
    PEER: 7051,
};

module.exports.PEER_HOME = '/etc/hyperledger/crypto';
module.exports.ORDERER_HOME = '/etc/hyperledger/crypto';
module.exports.PEER_TYPE_ORDER = 1;
module.exports.PEER_TYPE_PEER = 0;

module.exports.PORT_CA = 7080;
module.exports.PORT_ORDERER = 7050;
module.exports.PORT_PEER = 7051;

module.exports.BASE_DOMAIN_NAME = 'example.com';

module.exports.NODE_TYPE_PEER = 'peer';
module.exports.NODE_TYPE_ORDERER = 'orderer';

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