/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const CryptoCaService = require('../../src/services/fabric/tools/crypto-ca');
const CredentialHelper = require('../../src/services/fabric/tools/credential-helper');
const stringUtil = require('../../src/libraries/string-util');
const common = require('../../src/libraries/common');

async function testCryptoCaService() {
    let name = 'new-org';
    let host = '47.254.71.145';
    let options = {
        caName: stringUtil.getCaName(name),
        orgName: name,
        url: stringUtil.getUrl(common.PROTOCOL.HTTP, host, common.PORT.CA)
    };
    let cryptoCaService = new CryptoCaService(options);
    let result = await cryptoCaService.postContainerStart();
    if (result) {
        let credential = {};
        credential.name = name;
        credential.adminKey = result.enrollment.key.toBytes();
        credential.adminCert = result.enrollment.certificate;
        credential.rootCert = result.enrollment.rootCertificate;
        let filePath = CredentialHelper.storeOrgCredentials(credential);
        console.log(filePath);
    }
}

testCryptoCaService();
