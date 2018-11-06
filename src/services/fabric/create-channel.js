'use strict';

var fs = require('fs');
var path = require('path');
var query = require('./query');
var configTx = require('../../env').configTx;
var configtxlator = require('./configtxlator');
var logger = require('../../libraries/log4js').getLogger('Create-Channel');
var Client = require('fabric-client');

module.exports.createChannel = async function (profile, channelName, config) {
    try {
        let client = new Client();
        client.setAdminSigningIdentity(config.peerConfig.adminKey, config.peerConfig.adminCert, config.peerConfig.mspid);

        // read configtx
        var configtx = fs.readFileSync(path.join(__dirname, configTx.path));
        var envelope = await configtxlator.outputChannelCreateTx(profile, channelName, configtx, '.', '');

        // extract the channel config bytes from the envelope to be signed
        var channelConfig = client.extractChannelConfig(envelope);

        //Acting as a client in the given organization provided with "orgName" param
        // sign the channel config bytes as "endorsement", this is required by
        // the orderer's channel creation policy
        // this will use the admin identity assigned to the client when the connection profile was loaded
        let signature = client.signChannelConfig(channelConfig);
        let request = {
            config: channelConfig,
            signatures: [signature],
            orderer: await query.newOrderer(client, config),
            name: channelName,
            txId: client.newTransactionID(true) // get an admin based transactionID
        };

        // send to orderer
        var response = await client.createChannel(request);
        logger.debug('Response ::%j', response);
        if (response && response.status === 'SUCCESS') {
            logger.debug('Successfully created the channel \'' + channelName + '\'');
            let response = {
                success: true,
                message: 'Channel \'' + channelName + '\' created successfully'
            };
            return response;
        } else {
            logger.error('Failed to create the channel \'' + channelName + '\'');
            throw new Error('Failed to create the channel \'' + channelName + '\', ' + JSON.stringify(response));
        }
    } catch (err) {
        logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
        throw err;
    }
};
