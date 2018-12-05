/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

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
module.exports.CONSENSUS_KAFKA = 'kafka';
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
    GRPC: 'grpc',
    GRPCS: 'grpcs',
    HTTP: 'http',
    HTTPS: 'https',
    TCP: 'tcp',
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

//validator allow values
module.exports.DB_TYPE_LEVELDB = 'leveldb';
module.exports.DB_TYPE_COUCHDB = 'couchdb';
module.exports.DB_TYPE_LIST = [this.DB_TYPE_LEVELDB, this.DB_TYPE_COUCHDB];
module.exports.BLOCKCHAIN_TYPE_LIST = ['fabric'];
module.exports.CONSENSUS_LIST = [this.CONSENSUS_KAFKA, this.CONSENSUS_SOLO];
module.exports.VERSION_LIST = ['1.3'];

// chaincode
module.exports.CHAINCODE_GOPATH = '/tmp/gopath'; // The actual path:/tmp/gopath/src/chaincode
module.exports.CHAINCODE_PATH = 'chaincode';
module.exports.CHAINCODE_TYPE_GOLANG = 'golang';
module.exports.CHAINCODE_TYPE_JAVA = 'java';
module.exports.CHAINCODE_TYPE_NODE = 'node';
module.exports.CHAINCODE_STATE_NONE = 0;
module.exports.CHAINCODE_STATE_INSTALLED = 1; // The chaincode has been installed
module.exports.CHAINCODE_STATE_DEPLOYED = 2;
module.exports.CHAINCODE_STATE_UPGRADED = 3;

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
