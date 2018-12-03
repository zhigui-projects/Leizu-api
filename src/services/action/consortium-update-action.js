'use strict';

const Action = require('./action');

const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Consortium = require('../../models/consortium');
const CertAuthority = require('../../models/certauthority');
const Request = require('../../models/request');
const common = require('../../libraries/common');

module.exports = class ConsortiumUpdateAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let consortium = await this.getConsortium();
        if(consortium) {
            let configuration = {};
            let consortiumId = consortium._id;
            let condition = {consortium_id: consortiumId};
            //build network configuration
            configuration.name = consortium.name;
            configuration.sysChannel = common.SYSTEM_CHANNEL;
            configuration.orgs = [];
            await this.updateConsortiumConfiguration(consortiumId,configuration);
        }
    }

    async updateConsortiumConfiguration(consortiumId,configuration){
        await Consortium.findByIdAndUpdate(consortiumId, {network_config: JSON.stringify(configuration)});
    }

    async getConsortium(){
        let condition = {request_id: this.getRequestId()};
        let consortium = await Consortium.findOne(condition);
        return consortium;
    }

    getRequestId(){
        return this.context.get(this.registry.CONTEXT.REQUEST_ID);
    }
};