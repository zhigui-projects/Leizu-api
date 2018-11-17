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

    static async create(payload){
        const {name, consortiumId, domainName, host, port, username, password} = payload;
        let orgDto = {
            orgName: name,
            domainName: domainName,
            mspId: stringUtil.getMspId(name),
            consortiumId: consortiumId
        };
        let certAuthDto = {
            name: stringUtil.getCaName(name),
            consortiumId: consortiumId
        };
        try {
            let containerOptions = {
                name: name,
                domainName: domainName,
                port: common.PORT_CA
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
                    url: stringUtil.getUrl(common.PROTOCOL.HTTP, host, common.PORT_CA)
                };
                await utils.wait(`${options.url}/api/v1/cainfo`);
                let cryptoCaService = new CryptoCaService(options);
                let result = await cryptoCaService.postContainerStart();
                if (result) {
                    orgDto.adminKey = result.enrollment.key.toBytes();
                    orgDto.adminCert = result.enrollment.certificate;
                    orgDto.rootCert = result.enrollment.rootCertificate;
                    orgDto.mspPath = await CredentialHelper.storeCredentials(orgDto);
                }
                certAuthDto.url = options.url;
            }
            let organization = await DbService.addOrganization(orgDto);
            if (organization) {
                certAuthDto.orgId = organization._id;
                organization.ca = await DbService.addCertAuthority(certAuthDto);
            }
            return organization;
        } catch (err) {
            throw err;
        }
    }

};