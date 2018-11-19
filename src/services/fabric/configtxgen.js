'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const cryptoConfig = require('../../env').cryptoConfig;
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');

const batch_default = {
    BatchTimeout: '2s',
    BatchSize: {
        MaxMessageCount: 10,
        AbsoluteMaxBytes: '99 MB',
        PreferredMaxBytes: '512 KB'
    }
};

module.exports = class ConfigTxBuilder {
    constructor(options) {
        this._options = options;
        this._filePath = path.join(cryptoConfig.path, options.ConsortiumId);
    }

    //build information of organization
    _buildOrganization(org) {
        let obj = {
            Name: org.Name,
            ID: org.MspId,
            MSPDir: this._getMspPath(org.Name)
        };
        if (org.Type === common.PEER_TYPE_PEER) {
            obj.AnchorPeers = org.AnchorPeers;
        }
        return obj;
    }

    _getMspPath(orgName) {
        return path.join('data', this._options.ConsortiumId, orgName, 'msp');
    }

    //build orderer's information
    _buildOrderer() {
        let obj = {
            OrdererType: this._options.Orderer.OrdererType,
            Addresses: this._options.Orderer.Addresses
        };
        if (obj.OrdererType === common.CONSENSUS_KAFKE) {
            if (this._options.Orderer.Kafka) {
                obj.Kafka = this._options.Orderer.Kafka;
            } else {
                throw new Error('configtxgen not found kafka info');
            }
        }
        if (this._options.Orderer.BatchTimeout) {
            obj.BatchTimeout = this._options.Orderer.BatchTimeout;
        } else {
            obj.BatchTimeout = batch_default.BatchTimeout;
        }
        if (this._options.Orderer.BatchSize) {
            obj.BatchSize = this._options.Orderer.BatchSize;
        } else {
            obj.BatchSize = batch_default.BatchSize;
        }
        obj.Organizations = [];
        for (let org of this._options.Organizations) {
            if (org.Type === common.PEER_TYPE_ORDER) {
                obj.Organizations.push(this._buildOrganization(org));
            }
        }
        return obj;
    }

    _buildConsortiums() {
        let obj = {};
        let orgs = [];
        for (let org of this._options.Organizations) {
            if (org.Type === common.PEER_TYPE_PEER) {
                orgs.push(this._buildOrganization(org));
            }
        }
        obj[this._options.Consortium] = {Organizations: orgs};
        return obj;
    }

    _buildApplication() {
        let orgs = [];
        for (let org of this._options.Organizations) {
            if (org.Type === common.PEER_TYPE_PEER) {
                orgs.push(this._buildOrganization(org));
            }
        }
        return {Organizations: orgs};
    }

    //for add new org
    buildPrintOrg() {
        let configtx = this._buildApplication();
        let yamlData = yaml.safeDump(configtx);
        return yamlData;
    }

    //for create channel
    buildChannelCreateTx() {
        let configtx = {Profiles: {}};
        configtx.Profiles[common.CONFIFTX_OUTPUT_CHANNEL] = {
            Consortium: this._options.Consortium,
            Application: this._buildApplication()
        };
        let yamlData = yaml.safeDump(configtx);
        return yamlData;
    }

    //build configtx.yaml file for genesis block
    buildGenesisBlock() {
        let configtx = {Profiles: {}};
        configtx.Profiles[common.CONFIFTX_OUTPUT_GENESIS_BLOCK] = {
            Orderer: this._buildOrderer(),
            Consortiums: this._buildConsortiums()
        };

        configtx.Profiles[common.CONFIFTX_OUTPUT_CHANNEL] = {
            Consortium: this._options.Consortium,
            Application: this._buildApplication()
        };
        let yamlData = yaml.safeDump(configtx);
        utils.createDir(this._filePath);
        let configTxPath = path.join(this._filePath, cryptoConfig.name);
        fs.writeFileSync(configTxPath, yamlData);
        return yamlData;
    }
};