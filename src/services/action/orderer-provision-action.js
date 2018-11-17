'use strict';

const Action = require('./action');
const SshClient = require('../ssh/client');
const utils = require('../../libraries/utils');
const common = require('../../libraries/common');

module.exports = class OrdererProvisionAction extends Action {

    async execute(){
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let sshClient = new SshClient(params);
        let containerOptions = {
            name: params.name,
            domainName: utils.generateDomainName(params.name),
            port: common.PORT_ORDERER,
            workingDir: '/opt',
            ordererName: params.name,
            mspid: 'OrgOrderer'
        };
        if(this.isDebugMode){
            containerOptions.port = utils.generateRandomHttpPort();
            try{
                sshClient.exec(['rm','--force','orderer-'+ params.name]);
            }catch (err) {
                console.error(err);
            }
        }
        let parameters = {
            createContainerOptions: utils.generateOrdererCreateOptions(containerOptions)
        };
        await sshClient.createContainer(parameters.createContainerOptions);
    }

};