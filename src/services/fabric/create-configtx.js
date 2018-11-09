'use strict';
const fs = require('fs');
const path = require('path');
const env = require('../../env');
const yaml = require('js-yaml');
const GENESIS_TYPE = 1;
module.exports = class generateConfigTx {

    /**
     * constructor generateConfigTx file
     * @param options
     * options like this
     * {
     *     type:1,//type ==1 create genesis configtx ; type==2 create channel configtx
     *     consortiumId: 'xxxxxxxxxx',
     *     profile:'OrgsOrdererGenesis',
     *     channel:'OrgsChannel',
     *     ordererType:'kafka',
     *     orderOrg:'org0',
     *     orderer:{
     *         host:'order1-org0',
     *         port:7051
     *     },
     *     initOrg:'org1',
     *     initOrgAnchorPeer:{
     *         host:'peer1-org1',
     *         port:7050
     *     }
     * }
     */
    constructor(options) {
        this.options = options || {};
        this.consortiumId = this.options.consortiumId;
        this.fileDir = path.join(__dirname, env.configTx.dir);
        this.type = this.options.type;
        this.orderOrg = {};
        this.peerOrg = {};
        this.applicationDefaults = {Organizations: null};
        this.configTxObject = {
            Organizations: [],
            Application: this.applicationDefaults,
            Profiles: {},
        };
        if (!fs.existsSync(this.fileDir)) {
            fs.mkdirSync(this.fileDir);
        }
        this.fileDir = path.join(this.fileDir, this.consortiumId);
        if (!fs.existsSync(this.fileDir)) {
            fs.mkdirSync(this.fileDir);
        }
    }

    buildOrganizations() {
        this.peerOrg = {
            Name: this.options.initOrg,
            ID: this.options.initOrg + 'MSP',
            MSPDir: env.mspFile.serverDir.replace(/\$cId/g, this.consortiumId).replace(/\$org/g, this.options.initOrg),
            AnchorPeers: [{Host: this.options.initOrgAnchorPeer.host, Port: this.options.initOrgAnchorPeer.port}]
        };
        if (this.type === GENESIS_TYPE) {
            this.orderOrg = {
                Name: this.options.orderOrg,
                ID: this.options.orderOrg + 'MSP',
                MSPDir: env.mspFile.serverDir.replace(/\$cId/g, this.consortiumId).replace(/\$org/g, this.options.orderOrg)
            };
            this.configTxObject.Organizations.push(this.orderOrg);
        }
        this.configTxObject.Organizations.push(this.peerOrg);
    }

    buildOrgsOrdererGenesis() {
        return {
            OrdererType: this.options.ordererType,
            Addresses: [`${this.options.orderer.host}:${this.options.orderer.port}`],
            BatchTimeout: '2s',
            BatchSize: {
                MaxMessageCount: 10,
                AbsoluteMaxBytes: '99 MB',
                PreferredMaxBytes: '512 KB'
            },
            Kafka: {Brokers: ['127.0.0.1:9092']},
            Organizations: this.orderOrg
        };
    }

    buildConsortium() {
        return {
            Organizations: [this.peerOrg]
        };
    }

    buildProfiles() {
        let application = Object.assign({}, this.applicationDefaults);
        application.Organizations = [this.peerOrg];
        this.configTxObject.Profiles = {
            OrgsOrdererGenesis: {
                Orderer: this.buildOrgsOrdererGenesis(),
                Consortiums: this.buildConsortium()
            },
            OrgsChannel: {
                Consortiums: 'SampleConsortium',
                Application: application,
            }
        };
    }

    buildConfigTxFile() {
        this.buildOrganizations();
        this.buildProfiles();
        let yamlData = yaml.safeDump(this.configTxObject);
        fs.writeFileSync(path.join(this.fileDir, env.configTx.name), yamlData);
    }
};