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
        let consortiumId = await this.getConsortiumId();
        let condition = {consortium_id: consortiumId};
    }

    async getConsortiumId(){
        let condition = {request_id: this.getRequestId()};
        let consortium = await Consortium.findOne(condition);
        if(consortium){
            return consortium._id;
        }else{
            return null;
        }
    }

    getRequestId(){
        return this.context.get(this.registry.CONTEXT.REQUEST_ID);
    }
};