/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

var fs = require('fs');
var request = require('request');
var log4js = require('log4js');
var logger = log4js.getLogger('Configtxlator');
var host = require('../../../env').configtxlator;

var Configtxlator = class {
    constructor(endpoint) {
        this.endpoint = 'http://localhost:7059';

        if (typeof endpoint === 'string') {
            this.endpoint = endpoint;
        }
        logger.debug('Configtxlator server address: %s', this.endpoint);
    }

    encode(message, proto_name) {
        var url = this.endpoint.concat('/protolator/encode/', proto_name);
        logger.debug('Encode proto name: %s, request url: %s', proto_name, url);

        return Configtxlator.postBodyRequest(url, message);
    }

    decode(block, proto_name) {
        var url = this.endpoint.concat('/protolator/decode/', proto_name);
        logger.debug('Encode proto name: %s, request url: %s', proto_name, url);

        return Configtxlator.postBodyRequest(url, block);
    }

    computeDelta(original, updated, channel) {
        var url = this.endpoint.concat('/configtxlator/compute/update-from-configs');
        logger.debug('Compute delta for channel %s, request url: %s', channel, url);

        const formData = {
            'channel': channel,
            'original': {
                value: original,
                options: {
                    filename: 'original.proto',
                    contentType: 'application/octet-stream'
                }
            },
            'updated': {
                value: updated,
                options: {
                    filename: 'updated.proto',
                    contentType: 'application/octet-stream'
                }
            }
        };

        return Configtxlator.postFormRequest(url, formData);
    }

    outputGenesisBlock(profile, channelID, configtx, configPath, outputBlock) {
        var url = this.endpoint.concat('/configtxgen/genesis-block');
        logger.debug('Output genesisBlock %s, request url: %s', outputBlock, url);

        const formData = {
            'profile': profile,
            'channelID': channelID,
            'configtx': configtx,
            'configPath': configPath,
            'outputBlock': outputBlock
        };

        return Configtxlator.postFormRequest(url, formData);
    }

    outputChannelCreateTx(profile, channelID, configtx, configPath, outputCreateChannelTx) {
        var url = this.endpoint.concat('/configtxgen/channel-create-tx');
        logger.debug('Output createChannelTx %s, request url: %s', outputCreateChannelTx, url);

        const formData = {
            'profile': profile,
            'channelID': channelID,
            'configtx': configtx,
            'configPath': configPath,
            'outputCreateChannelTx': outputCreateChannelTx
        };

        return Configtxlator.postFormRequest(url, formData);
    }

    printOrg(printOrg, configtx, configPath) {
        var url = this.endpoint.concat('/configtxgen/print-org');
        logger.debug('Output print org %s, request url: %s', printOrg, url);

        const formData = {
            'printOrg': printOrg,
            'configtx': configtx,
            'configPath': configPath
        };

        return Configtxlator.postFormRequest(url, formData);
    }

    async upload(consortiumId, orgName, archive) {
        var url = this.endpoint.concat('/configtxlator/upload');
        logger.debug('Upload msp files %s, request url: %s', archive, url);

        const formData = {
            destination: `./data/${consortiumId}/${orgName}/`,
            msp: {
                value: fs.createReadStream(archive),
                options: {
                    contentType: 'multipart/form-data'
                }
            }
        };

        return await Configtxlator.postFormRequest(url, formData);
    }

    static postBodyRequest(url, message) {
        return new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'POST',
                body: message,
                encoding: null,
                resolveWithFullResponse: true
            }, (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    resolve(body);
                } else if (err) {
                    reject(err);
                } else {
                    reject(res);
                }
            });
        });
    }

    static postFormRequest(url, formData) {
        return new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'POST',
                encoding: null,
                headers: {
                    accept: '/',
                    expect: '100-continue'
                },
                formData: formData
            }, (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    resolve(Buffer.from(body, 'binary'));
                } else if (err) {
                    reject(err);
                } else {
                    reject(res);
                }
            });
        });
    }
};

const configtxlator = new Configtxlator(process.env.CONFIGTXLATOR_URI || host.url);
module.exports = configtxlator;
