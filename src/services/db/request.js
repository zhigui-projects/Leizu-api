'use strict';

const uuid = require('uuid/v1');
const RequestModel = require('../../models/request');
const common = require('../../libraries/common');

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
        return request;
    }

};