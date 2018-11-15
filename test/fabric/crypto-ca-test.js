'use strict';

const CryptoCaService = require('../../src/services/fabric/crypto-ca');
const CredentialHelper = require('../../src/services/fabric/credential-helper');
const stringUtil = require('../../src/libraries/string-util');
const common = require('../../src/libraries/common');

async function testCryptoCaService() {
    let name = 'new-org';
    let host = '47.254.71.145';
    let options = {
        caName: stringUtil.getCaName(name),
        orgName: name,
        url: stringUtil.getUrl(common.PROTOCOL.HTTP, host, common.PORT_CA)
    };
    let cryptoCaService = new CryptoCaService(options);
    let result = await cryptoCaService.postContainerStart();
    if (result) {
        let credential = {};
        credential.name = name;
        credential.adminKey = result.enrollment.key.toBytes();
        credential.adminCert = result.enrollment.certificate;
        credential.rootCert = result.enrollment.rootCertificate;
        let filePath = CredentialHelper.storeCredentials(credential);
        console.log(filePath);
    }
}

testCryptoCaService();