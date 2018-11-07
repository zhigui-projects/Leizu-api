'use strict';

const plan = require('flightplan');
const NodeSSH = require('node-ssh');
const AbstractSSH = require('./ssh');

module.exports = class ZigClient extends AbstractSSH {

    constructor(options){
        super(options);
    }


};