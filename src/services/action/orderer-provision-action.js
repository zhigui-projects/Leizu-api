'use strict';

const Action = require('./action');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');
const OrderService = require('../fabric/orderer');

module.exports = class OrdererProvisionAction extends Action {

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let configuration = {
            domainName: utils.generateDomainName(params.name),
            options: {
                peerOrgs: [{
                    anchorPeer: {
                        host: 'peer-39-106-149-201.org3.example.com',
                        port: 7051
                    },
                }],
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