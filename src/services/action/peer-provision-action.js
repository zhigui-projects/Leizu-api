'use strict';

const Action = require('./action');
const SshClient = require('../ssh/client');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');

module.exports = class PeerProvisionAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let sshClient = new SshClient(params);
        let containerOptions = {
            name: params.name,
            peerName: params.name,
            domainName: utils.generateDomainName(params.name),
            port: common.PORT_PEER
        };
        if(this.isDebugMode){
            containerOptions.port = utils.generateRandomHttpPort();
            try{
                sshClient.exec(['rm','--force',params.name + '.' + containerOptions.domainName]);
            }catch (err) {
                console.error(err);
            }
        }
        let parameters = {
            createContainerOptions: utils.generatePeerContainerOptions(common.MODES.SSH,containerOptions)
        };
        await sshClient.createContainer(parameters.createContainerOptions);
    }

};