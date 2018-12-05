/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Action = require('./action');

const Channel = require('../../models/channel');
const Organization = require('../../models/organization');
const Peer = require('../../models/peer');
const Consortium = require('../../models/consortium');
const CertAuthority = require('../../models/certauthority');
const Request = require('../../models/request');
const common = require('../../libraries/common');

module.exports = class RequestRollBackAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let consortiumId = await this.getConsortiumId();
        let condition = {consortium_id: consortiumId};
        await Organization.deleteOne(condition);
        await Channel.deleteOne(condition);
        await Peer.deleteOne(condition);
        await CertAuthority.deleteOne(condition);
        await Consortium.findByIdAndDelete(consortiumId);
        let requestId = this.getRequestId();
        await Request.findByIdAndUpdate(requestId,{status: common.REQUEST_STATUS_ERROR});
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