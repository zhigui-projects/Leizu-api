'use strict';

const request = require('request');
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
        return new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'POST',
                body: message,
                encoding: null,
                resolveWithFullResponse: true
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else if (error) {
                    reject(error);
                } else {
                    reject(response);
                }
            });
        });
    }

    decode(block, proto_name) {
        var url = this.endpoint.concat('/protolator/decode/', proto_name);
        logger.debug('Encode proto name: %s, request url: %s', proto_name, url);

        return new Promise((resolve, reject) => {
            request({
                url: url,
                method: 'POST',
                body: block,
                encoding: null,
                resolveWithFullResponse: true
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else if (error) {
                    reject(error);
                } else {
                    reject(response);
                }
            });
        });
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
                if (err) {
                    logger.error('Failed to compute delta get the updated configuration:' + err);
                    reject(err);
                } else {
                    resolve(Buffer.from(body, 'binary'));
                }
            });
        });
    }
};

const configtxlator = new Configtxlator(host.url);
module.exports = configtxlator;
