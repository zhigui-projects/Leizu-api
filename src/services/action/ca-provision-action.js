'use strict';

const Action = require('./action');
const SshClient = require('../ssh/client');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');

module.exports = class CAProvisionAction extends Action {

    constructor(){
        super();
    }

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let sshClient = new SshClient(params.caNode);
        let containerOptions = {
            name: params.caName,
            domainName: utils.generateDomainName(params.caName),
            port: common.PORT_CA
        };
        if(this.isDebugMode){
            containerOptions.port = utils.generateRandomHttpPort();
            try{
                sshClient.exec(['rm','--force','ca-'+ params.caName]);
            }catch (err) {
                console.error(err);
            }
        }
        let parameters = {
            createContainerOptions: utils.generateCertAuthContainerCreateOptions(containerOptions)
        };
        await sshClient.createContainer(parameters.createContainerOptions);
    }

};