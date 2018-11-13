'use strict';

const uuid = require('uuid/v1');
const RequestModel = require('../../models/request');

var Request = class {

    constructor() {
        this._consortium_config = null;
    }

    async load(dto) {
        let request = new RequestModel();
        request.uuid = uuid();
        request.name = dto.name;
        request.type = dto.type;
        request.version = dto.dbType;
        request.dbType = dto.ledgerDB;
        request.consensusType = dto.consensusType;
        request.kafka = dto.kafka;
        request.zookeeper = dto.zookeeper;
        request.organizations = dto.organizations;
        request.channel = JSON.stringify(dto.channel);
        request = await request.save();
        this._consortium_config = request;
        return request;
    }

    getServiceType() {
        return this._consortium_config.type;
    }

    getLedgerDB() {
        return this._consortium_config.ledgerDB;
    }

    getConsensusType() {
        return this._consortium_config.consensusType;
    }

    getKafka() {
        return this._consortium_config.kafka;
    }

    getZookeeper() {
        return this._consortium_config.zookeeper;
    }

    getOrganizations() {
        return this._consortium_config.organizations;
    }

    getChannel() {
        return JSON.parse(this._consortium_config.channel);
    }

    getPeers(){
        return [];
    }

    getOrderers(){
        return [];
    }

    static findServiceType(id) {
        var where = {_id: id};
        var query = {serviceType: 1};
        return RequestModel.find(where, query);
    };

    static findLedgerDB(id) {
        var where = {_id: id};
        var query = {ledgerDB: 1};
        return RequestModel.find(where, query);
    };

    static findConsensusType(id) {
        var where = {_id: id};
        var query = {consensusType: 1};
        return RequestModel.find(where, query);
    };

    static findKafka(id) {
        var where = {_id: id};
        var query = {kafka: 1};
        return RequestModel.find(where, query);
    };

    static findZookeeper(id) {
        var where = {_id: id};
        var query = {zookeeper: 1};
        return RequestModel.find(where, query);
    };

    static findOrganizations(id) {
        var where = {_id: id};
        var query = {organizations: 1};
        return RequestModel.find(where, query);
    };

    static findChannel(id) {
        var where = {_id: id};
        var query = {channel: 1};
        return RequestModel.find(where, query);
    };

};

module.exports = Request;