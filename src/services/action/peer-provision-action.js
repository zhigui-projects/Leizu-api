'use strict';

const Action = require('./action');
const PeerPlan = require('../plan/peer');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');

module.exports = class PeerProvisionAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let peerPlan = new PeerPlan(params);
        let containerOptions = {
            name: params.name,
            domainName: utils.generateDomainName(params.name),
            port: common.PORT_PEER
        };
        let parameters = {
            createContainerOptions: utils.generatePeerContainerOptions(common.MODES.SSH,containerOptions)
        };
        peerPlan.setParameters(parameters);
        peerPlan.run();
    }

};