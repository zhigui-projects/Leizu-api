'use strict';

const uuid = require('uuid/v1');
const logger = require('../../libraries/log4js');
const common = require('../../libraries/common');
const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Orderer = require('../../models/orderer');
const Peer = require('../../models/peer');
const stringUtil = require('../../libraries/string-util');
const CredentialHelper = require('../fabric/credential-helper');
const config = require('../../env');
const DockerClient = require('../docker/client');
const DbService = require('./dao');

module.exports = class FabricService {

    constructor(consortiumId) {
        this.isFabric = true;
        this.consortiumId = consortiumId;
    }

    static getInstance(consortiumId) {
        let fabricService = new FabricService(consortiumId);
        return fabricService;
    }

    async findChannel(filter) {
        let condition = filter || {};
        try {
            let channel = await Channel.findOne(condition);
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addChannel(dto, result) {
        let channel = new Channel();
        channel.uuid = uuid();
        channel.name = dto.name;
        if (dto.configuration && dto.configuration.config) {
            channel.configuration = JSON.stringify(dto.configuration.config.channel_group);
        }
        channel.consortium_id = this.consortiumId;
        if (result) {
            channel.orgs = result.organizations.map(org => org._id);
            channel.peers = result.peers.map(peer => peer._id);
        }
        try {
            channel = await channel.save();
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    static async findChannelAndUpdate(channelId, result) {
        try {
            let orgs = result.organizations.map(org => org._id);
            let peers = result.peers.map(peer => peer._id);
            let channel = await Channel.findByIdAndUpdate(channelId, {orgs: orgs, peers: peers});
            return channel;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }


    async addOrganization(dto) {
        let organization = new Organization();
        organization.uuid = uuid();
        organization.name = dto.name;
        organization.msp_id = dto.id;
        organization.consortium_id = this.consortiumId;
        organization.admin_key = dto.adminKey;
        organization.admin_cert = dto.admins;
        organization.root_cert = dto.rootCerts;
        organization.msp_path = dto.mspPath;
        try {
            organization = await organization.save();
            return organization;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async storeCredentials(dto) {
        try {
            let orgDto = {
                orgName: dto.name,
                consortiumId: this.consortiumId,
                adminKey: dto.adminKey,
                adminCert: dto.admins,
                signcerts: dto.admins,
                rootCert: dto.rootCerts,
                tlsRootCert: dto.rootCerts
            };

            dto.mspPath = await CredentialHelper.storeOrgCredentials(orgDto);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrderer(dto) {
        let orderer = new Orderer();
        orderer.uuid = uuid();
        orderer.location = dto.host + dto.port;
        try {
            orderer = await orderer.save();
            return orderer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async findPeerByName(name) {
        try {
            let peer = await Peer.findOne({consortium_id: this.consortiumId, name: name});
            return peer ? peer : null;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addOrdererPeer(networkConfig, dto) {
        let existedPeer = await this.findPeerByName(dto.host);
        if (existedPeer) return existedPeer;
        FabricService.getPeerUrl(networkConfig, dto);
        let peer = new Peer();
        peer.uuid = uuid();
        peer.location = dto.location || dto.host + common.SEPARATOR_COLON + dto.port;
        peer.name = dto.host;
        peer.consortium_id = this.consortiumId;
        peer.type = 1;
        let organization = await DbService.findOrganizationByName(this.consortiumId, stringUtil.getOrgName(dto.mspid));
        if (organization) peer.org_id = organization._id;
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async addPeer(networkConfig, dto) {
        let name = dto.endpoint.slice(0, dto.endpoint.indexOf(common.SEPARATOR_COLON));
        dto.host = name;
        let existedPeer = await this.findPeerByName(name);
        if (existedPeer) return existedPeer;
        FabricService.getPeerUrl(networkConfig, dto);
        let peer = new Peer();
        peer.uuid = uuid();
        peer.name = name;
        peer.location = dto.location || dto.endpoint;
        peer.consortium_id = this.consortiumId;
        let organization = await DbService.findOrganizationByName(this.consortiumId, stringUtil.getOrgName(dto.mspid));
        if (organization) peer.org_id = organization._id;
        try {
            peer = await peer.save();
            return peer;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    static async getOrgAdminKey(networkConfig, org) {
        for (let item of networkConfig.orgs) {
            if (item.mspId === org.id) {
                org.adminKey = item.signIdentity.adminKey;
                return;
            }
        }
        logger.warn('Not provide sign identity private key for ' + org.id);
    }

    static async addCertAuthority(networkConfig, org) {
        for (let item of networkConfig.orgs) {
            if (item.mspId === org.msp_id) {
                let ca = item.ca;
                ca.orgId = org._id;
                ca.consortiumId = org.consortium_id;
                return DbService.addCertAuthority(ca);
            }
        }
    }

    static getPeerUrl(networkConfig, dto) {
        for (let item of networkConfig.orgs) {
            for (let peer of item.peers) {
                if (peer['server-hostname'] === dto.host) {
                    dto.location = peer.url.split('://')[1];
                    return;
                }
            }
        }
        logger.warn('Not provide peer url for ' + dto.host);
    }

    async handleDiscoveryResults(networkConfig, channelInfo, results) {
        let result = {
            organizations: [],
            orderers: [],
            peers: [],
        };
        if (results) {
            for (let index = 0; index < results.organizations.length; index++) {
                let org = results.organizations[index];
                org.name = stringUtil.getOrgName(org.id);
                let organization = await DbService.findOrganizationByName(this.consortiumId, org.name);
                if (!organization) {
                    await FabricService.getOrgAdminKey(networkConfig, org);
                    await this.storeCredentials(org);
                    organization = await this.addOrganization(org);
                    await FabricService.addCertAuthority(networkConfig, organization);
                }
                result.organizations.push(organization);
            }
            // transfer certs file to configtxlator for update channel
            let connectionOptions = config.configtxlator.connectionOptions;
            if (process.env.CONFIGTXLATOR_HOST && process.env.CONFIGTXLATOR_USERNAME && process.env.CONFIGTXLATOR_PASSWORD) {
                connectionOptions = {
                    host: process.env.CONFIGTXLATOR_HOST,
                    username: process.env.CONFIGTXLATOR_USERNAME,
                    password: process.env.CONFIGTXLATOR_PASSWORD,
                    port: process.env.CONFIGTXLATOR_PORT || 22
                };
            }
            await DockerClient.getInstance(connectionOptions).transferDirectory({
                localDir: `${config.cryptoConfig.path}/${this.consortiumId}`,
                remoteDir: `${config.configtxlator.dataPath}/${this.consortiumId}`
            });
            for (let index = 0; index < results.orderers.length; index++) {
                let orderer = await this.addOrdererPeer(networkConfig, results.orderers[index]);
                result.orderers.push(orderer);
            }
            for (let index = 0; index < results.peers.length; index++) {
                let peer = await this.addPeer(networkConfig, results.peers[index]);
                result.peers.push(peer);
            }
        }
        let channelDto = {
            name: channelInfo.channel_id,
            configuration: channelInfo.channelConfig
        };
        let channelDb = await this.addChannel(channelDto, result);
        result.channel_id = channelDb._id;

        return result;
    }

    async updateChannel(channelId, mapData) {
        let peerIds = [];
        let orgIds = [];

        if (mapData.peers) {
            for (let peer of mapData.peers) {
                peerIds.push(peer._id);
            }
        }

        if (mapData.orderers) {
            for (let orderer of mapData.orderers) {
                peerIds.push(orderer._id);
            }
        }

        if (mapData.organizations) {
            for (let organization of mapData.organizations) {
                orgIds.push(organization._id);
            }
        }
        let updateItems = {
            peers: peerIds,
            orgs: orgIds
        };
        await Channel.findByIdAndUpdate(channelId, updateItems);
    }
};
