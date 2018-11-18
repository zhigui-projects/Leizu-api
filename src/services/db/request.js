'use strict';

const uuid = require('uuid/v1');
const RequestModel = require('../../models/request');
const common = require('../../libraries/common');
const Consortium = require('../../models/consortium');

module.exports = class RequestDaoService {

    constructor() {

    }

    async addRequest(dto) {
        let request = new RequestModel();
        request.uuid = uuid();
        request.name = dto.name;
        request.status = common.REQUEST_STATUS_PENDING;
        request.configuration = JSON.stringify(dto);
        request = await request.save();
        dto.requestId = request._id;
        let consortium =  await this.addConsortiumByRequest(dto);
        request.consortiumId = consortium._id;
        return request;
    }

    async addConsortiumByRequest(dto){
        let consortium = new Consortium();
        consortium.name = dto.name;
        consortium.uuid = uuid();
        consortium.network_config = JSON.stringify(dto);
        consortium.request_id = dto.requestId;
        consortium = await consortium.save();
        return consortium;
    }

    async updateStatusById(id, status){
        await RequestModel.findOneAndUpdate({_id: this.request._id},{status: status});
    }

};