'use strict';

const CryptoCaService = require('../../services/fabric/crypto-ca');
const stringUtil = require('../../libraries/string-util');
const common = require('../../libraries/common');

async function testCryptoCaService() {
    let name = 'new-org';
    let host = '47.254.71.145';
    let options = {
        caName: stringUtil.getCaName(name),
        orgName: name,
        url: stringUtil.getUrl(common.PROTOCOL_HTTP, host, common.PORT_CA)
    };
    let cryptoCaService = new CryptoCaService(options);
    let result = await cryptoCaService.postContainerStart();
    console.info(result);
}

testCryptoCaService();