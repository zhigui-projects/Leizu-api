/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

const mongoose = require('mongoose');
const config = require('../env').database;
const logger = require('log4js').getLogger('mongoose');

const options = {
    useNewUrlParser: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect(process.env.MONGODB_URI || config.url, options)
    .then(() => {
        logger.info('MongoDB is connected');
    })
    .catch((err) => {
        logger.error(`MongoDB connection error: ${err}`);
    });
mongoose.set('debug', config.debug || false);

module.exports = mongoose;
