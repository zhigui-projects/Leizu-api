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
        request.serviceName = dto.serviceName;
        request.version = dto.version;
        request.serviceType = dto.serviceType;
        request.ledgerDB = dto.ledgerDB;
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
        return this._consortium_config.serviceType;
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

    static findServiceType(consortiumId) {
        var where = {_id: consortiumId};
        var query = {serviceType: 1};
        return ConsortiumCreate.find(where, query);
    };

    static findLedgerDB(consortiumId) {
        var where = {_id: consortiumId};
        var query = {ledgerDB: 1};
        return ConsortiumCreate.find(where, query);
    };

    static findConsensusType(consortiumId) {
        var where = {_id: consortiumId};
        var query = {consensusType: 1};
        return ConsortiumCreate.find(where, query);
    };

    static findKafka(consortiumId) {
        var where = {_id: consortiumId};
        var query = {kafka: 1};
        return ConsortiumCreate.find(where, query);
    };

    static findZookeeper(consortiumId) {
        var where = {_id: consortiumId};
        var query = {zookeeper: 1};
        return ConsortiumCreate.find(where, query);
    };

    static findOrganizations(consortiumId) {
        var where = {_id: consortiumId};
        var query = {organizations: 1};
        return ConsortiumCreate.find(where, query);
    };

    static findChannel(consortiumId) {
        var where = {_id: consortiumId};
        var query = {channel: 1};
        return ConsortiumCreate.find(where, query);
    };

};

module.exports = Request;