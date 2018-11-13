'use strict';

const Action = require('./action');

const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Consortium = require('../../models/consortium');
const CertAuthority = require('../../models/certauthority');
const Request = require('../../models/certauthority');
const common = require('../../libraries/common');

module.exports = class RequestRollBackAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let consortiumId = this.getConsortiumId();
        let condition = {consortium_id: consortiumId};
        await Organization.remove(condition);
        await Channel.remove(condition);
        await Peer.remove(condition);
        await CertAuthority.remove(condition);
        await Consortium.findByIdAndDelete(consortiumId);
        let requestId = this.getRequestId();
        await Request.findByIdAndUpdate(requestId,{status: common.REQUEST_STATUS_ERROR});
    }

    getConsortiumId(){
        return this.context.get(this.registry.CONTEXT.CONSORTIUM_ID);
    }

    getRequestId(){
        return this.context.get(this.registry.CONTEXT.REQUEST_ID);
    }
};