'use strict';

module.exports = class AbstractSSH {

    constructor(options){
        this.options = options;
    }

    async transferFile(filePath, options){
        throw new Error("not implemented");
    }

    async createContainer(parameters){
        throw new Error('abstract function called');
    }

}