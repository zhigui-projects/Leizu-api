'use strict';

const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const stringUtil = require('../../libraries/string-util');
const config = require('../../env');
const CredentialHelper = require('./credential-helper');
const CryptoCaService = require('./crypto-ca');
const DbService = require('../db/dao');
const DockerClient = require('../docker/client');

module.exports = class OrganizationService {

    static async create(payload) {
        const {name, consortiumId, domainName, host, port, username, password} = payload;
        let consortium = await DbService.getConsortiumById(consortiumId);
        if (!consortium) {
            throw  new Error('The consortium not exist');
        }
        let organization = await DbService.findOrganizationByName(consortiumId, name);
        if (organization) {
            throw  new Error('The organization name already exists.');
        }

        let orgDto = {
            orgName: name,
            domainName: domainName,
            mspId: stringUtil.getMspId(name),
            consortiumId: consortiumId
        };
        let caPort = common.PORT_CA;
        // caPort = utils.generateRandomHttpPort();
        try {
            let containerOptions = {
                name: name,
                domainName: domainName,
                port: caPort
            };
            let parameters, connectOptions = null;
            if (config.docker.enabled) {
                connectOptions = {
                    protocol: common.PROTOCOL.HTTP,
                    host: host,
                    port: port || config.docker.port
                };
                parameters = utils.generateCertAuthContainerOptions(containerOptions);
            } else {
                connectOptions = {
                    username: username,
                    password: password,
                    host: host,
                    port: port
                };
                parameters = utils.generateCertAuthContainerCreateOptions(containerOptions);
            }

            let container = await DockerClient.getInstance(connectOptions).createContainer(parameters);
            if (container) {
                let options = {
                    caName: stringUtil.getCaName(name),
                    orgName: name,
                    url: stringUtil.getUrl(common.PROTOCOL.HTTP, host, caPort)
                };
                await utils.wait(`${options.url}/api/v1/cainfo`);
                let cryptoCaService = new CryptoCaService(options);
                let result = await cryptoCaService.postContainerStart();
                if (result) {
                    orgDto.adminKey = result.enrollment.key.toBytes();
                    orgDto.adminCert = result.enrollment.certificate;
                    orgDto.signcerts = result.enrollment.certificate;
                    orgDto.rootCert = result.enrollment.rootCertificate;
                    orgDto.tlsRootCert = result.enrollment.rootCertificate;
                    orgDto.mspPath = await CredentialHelper.storeOrgCredentials(orgDto);
                    // transfer certs file to configtxlator for update channel
                    const configTxPath = `${config.configtxlator.dataPath}/${consortiumId}/${name}`;
                    await DockerClient.getInstance(config.configtxlator.connectionOptions).transferDirectory({
                        localDir: orgDto.mspPath,
                        remoteDir: configTxPath
                    });
                }
                let organization = await DbService.addOrganization(orgDto);
                if (organization) {
                    await DbService.addCertAuthority({
                        name: options.caName,
                        url: options.url,
                        orgId: organization._id,
                        consortiumId: consortiumId
                    });
                }
                return organization;
            }
        } catch (err) {
            throw err;
        }
    }

};