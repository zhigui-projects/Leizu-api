'use strict';

var query = require('./query');
var configtxlator = require('./configtxlator');
var logger = require('../../libraries/log4js').getLogger('Create-Channel');
var Client = require('fabric-client');
var ConfigTxBuilder = require('./configtxgen');
const common = require('../../libraries/common');
const utils = require('../../libraries/utils');
const BlockDecoder = require('fabric-client/lib/BlockDecoder');

module.exports.createChannel = async function (channelCreateTx, channelName, config) {
    try {
        let client = new Client();
        client.setAdminSigningIdentity(config.peerConfig.adminKey, config.peerConfig.adminCert, config.peerConfig.mspid);
        let orderer = await query.newOrderer(client, config);
        let channel = client.newChannel(channelName);
        channel.addOrderer(orderer);

        var configtxgen = new ConfigTxBuilder(channelCreateTx);
        var configtx = Buffer.from(configtxgen.buildChannelCreateTx());
        var envelope = await configtxlator.outputChannelCreateTx(common.CONFIFTX_OUTPUT_CHANNEL, channelName, configtx, '.', '');

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
            orderer: orderer,
            name: channelName,
            txId: client.newTransactionID(true) // get an admin based transactionID
        };

        // send to orderer
        var response = await client.createChannel(request);
        logger.debug('Response ::%j', response);
        if (response && response.status === 'SUCCESS') {
            logger.debug('Successfully created the channel \'' + channelName + '\'');
            await utils.sleep(1000);
            const configEnvelope = await channel.getChannelConfigFromOrderer();
            if (configEnvelope) {
                let configJson = BlockDecoder.HeaderType.decodePayloadBasedOnType(configEnvelope.toBuffer(), 1);
                return configJson;
            }
        } else {
            logger.error('Failed to create the channel \'' + channelName + '\'');
            throw new Error('Failed to create the channel \'' + channelName + '\', ' + JSON.stringify(response));
        }
    } catch (err) {
        logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
        throw err;
    }
};
