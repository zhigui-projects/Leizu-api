"use strict";

const Docker = require('dockerode');
const logger = require('../../libraries/log4js');

module.exports = class DockerClient {
    
    constructor(connectOptions){
        this.connectOptions = connectOptions;
        this.docker = new Docker(connectOptions);
    }
    
    static getInstance(connectOptions){
        let dockerClient = new DockerClient(connectOptions);
        return dockerClient;
    }
    
    async createContainer(options){
        try{
           let container = await this.docker.createContainer(options);
           container.start();
           return container;
        }catch(err){
            logger.error(err);
            return null;
        }
    }

}