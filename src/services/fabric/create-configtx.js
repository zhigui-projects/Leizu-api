'use strict';
const fs = require('fs');
const path = require('path');
const env = require('../../env');
const yaml = require('js-yaml');
/**
 * help information for how to use
 * const CreateConfigtx = require(path);
 * let option = {
            consortiumId: 'xxxxxxxxxx',
            profile: 'OrgsOrdererGenesis',
            channel: 'OrgsChannel',
            ordererType: 'kafka',
            orderOrg: 'org0',
            orderer: {
                host: 'order1-org0',
                port: 7051
            },
            initOrg: 'org1',
            initOrgAnchorPeer: {
                host: 'peer1-org1',
                port: 7050
            },
            kafka: [
                {
                    host: '127.0.2.1',
                    port: '9999'
                }
            ]
        };
 * let configtxPath = new CreateConfigtx(option).buildGenesisConfigTxFile();
 * @type {module.generateConfigTx}
 */
module.exports = class generateConfigTx {
    constructor(options) {
        this.options = options || {};
        this.orderOrg = {};
        this.peerOrg = {};
        this.applicationDefaults = {Organizations: null};
        this.configTxObject = {
            Organizations: [],
            Application: this.applicationDefaults,
            Profiles: {},
        };
        this.init(this.options);
    }

    //init consortiumId and create directory for configtx.yaml
    init(options) {
        this.consortiumId = options.consortiumId;
        this.fileDir = path.join(__dirname, env.configTx.dir);
        if (!fs.existsSync(this.fileDir)) {
            fs.mkdirSync(this.fileDir);
        }
        this.fileDir = path.join(this.fileDir, options.consortiumId);
        if (!fs.existsSync(this.fileDir)) {
            fs.mkdirSync(this.fileDir);
        }
    }

    //build information of peer's organization
    buildPeerOrganization() {
        let mspDir = env.mspFile.containerPath.replace(/\$cId/g, this.consortiumId).replace(/\$org/g, this.options.initOrg);
        this.peerOrg = {
            Name: this.options.initOrg,
            ID: this.options.initOrg + 'MSP',
            MSPDir: mspDir,
            AnchorPeers: [{Host: this.options.initOrgAnchorPeer.host, Port: this.options.initOrgAnchorPeer.port}]
        };
        this.configTxObject.Organizations.push(this.peerOrg);
    }

    //build information of orderer's organization
    buildOrderOrganization() {
        let mspDir = env.mspFile.containerPath.replace(/\$cId/g, this.consortiumId).replace(/\$org/g, this.options.initOrg);
        this.orderOrg = {
            Name: this.options.orderOrg,
            ID: this.options.orderOrg + 'MSP',
            MSPDir: mspDir
        };
        this.configTxObject.Organizations.push(this.orderOrg);
    }

    //build orderer's information
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
            Kafka: {Brokers: this.buildKafka()},
            Organizations: [this.orderOrg]
        };
    }

    //build consortium's info
    buildConsortium() {
        return {
            SampleConsortium: {
                Organizations: [this.peerOrg]
            }
        };
    }

    //build profile's information
    buildChannelForProfiles() {
        let application = Object.assign({}, this.applicationDefaults);
        application.Organizations = [this.peerOrg];
        this.configTxObject.Profiles.OrgsChannel = {
            Consortium: 'SampleConsortium',
            Application: application,
        };
    }

    buildOrdererGenssisForProfile() {
        this.configTxObject.Profiles.OrgsOrdererGenesis = {
            Orderer: this.buildOrgsOrdererGenesis(),
            Consortiums: this.buildConsortium()
        };
    }

    //build kafka's information
    buildKafka() {
        let kafkaList = ['127.0.0.1:9092'];
        if (this.options.ordererType === 'kafka') {
            if (this.options.kafka.length > 0) {
                kafkaList = this.options.kafka.map((item) => {
                    return `${item.host}:${item.port}`;
                });
            }
        }
        return kafkaList;
    }

    //build configtx.yaml file for genesis block
    buildGenesisConfigTxFile() {
        this.buildOrderOrganization();
        this.buildPeerOrganization();
        this.buildOrdererGenssisForProfile();
        this.buildChannelForProfiles();
        let yamlData = yaml.safeDump(this.configTxObject);
        let configTxPath = path.join(this.fileDir, env.configTx.name);
        fs.writeFileSync(configTxPath, yamlData);
        return configTxPath;
    }

    //build configtx.yaml file for add organization
    buildAddOrgConfigTxFile() {
        this.buildPeerOrganization();
        this.buildChannelForProfiles();
        let yamlData = yaml.safeDump(this.configTxObject);
        let configTxPath = path.join(this.fileDir, env.configTx.name);
        fs.writeFileSync(configTxPath, yamlData);
        return configTxPath;
    }

};