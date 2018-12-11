/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const fs = require('fs');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const stringUtil = require('../../libraries/string-util');
const CredentialHelper = require('./tools/credential-helper');
const CryptoCaService = require('./tools/crypto-ca');
const DbService = require('../db/dao');
const SSHClient = require('../ssh/client');
const configtxlator = require('./tools/configtxlator');

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
        let caPort = common.PORT.CA;
        if (utils.isSingleMachineTest()) {
            caPort = utils.generateRandomHttpPort();
        }
        try {
            const containerOptions = {
                name: name,
                domainName: domainName,
                port: caPort
            };

            const connectOptions = {
                username: username,
                password: password,
                host: host,
                port: port
            };
            const parameters = utils.generateCertAuthContainerCreateOptions(containerOptions);

            let container = await SSHClient.getInstance(connectOptions).createContainer(parameters);
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
                    await configtxlator.upload(orgDto.consortiumId, orgDto.orgName, `${orgDto.mspPath}.zip`);
                    fs.unlinkSync(`${orgDto.mspPath}.zip`);
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
