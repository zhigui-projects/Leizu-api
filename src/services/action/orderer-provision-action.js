'use strict';

const Action = require('./action');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const OrderService = require('../fabric/orderer');
const DbService = require('../db/dao');

module.exports = class OrdererProvisionAction extends Action {

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let peerOrgs = [];
        for(let orgId of params.peerOrganizationIds){
            let orgDto = {};
            let organization = await DbService.findOrganizationById(orgId);
            if(organization){
                orgDto.name = organization.name;
                orgDto.msp_id = organization.msp_id;
                let peers = await DbService.findPeersByOrgId(orgId, common.PEER_TYPE_PEER);
                if (peers) {
                    let item = peers[0];
                    let flag = item.location.indexOf(common.SEPARATOR_COLON);
                    let host = item.location.slice(0, flag);
                    let port = item.location.slice(flag + common.SEPARATOR_COLON.length);
                    orgDto.anchorPeer = {host: host, port: port}
                }
            }
            peerOrgs.push(orgDto);
        }
        let configuration = {
            domainName: utils.generateDomainName(params.name),
            options: {
                peerOrgs: peerOrgs,
                ordererType: params.ordererType,
                kafka: params.kafkaBrokers
            }
        };
        utils.extend(configuration,params);
        if(this.isDebugMode){
            configuration.ordererPort = utils.generateRandomHttpPort();
        }
        return await OrderService.create(configuration);
    }

};