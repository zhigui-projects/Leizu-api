'use strict';

module.exports = class AbstractSSH {

    constructor(options) {
        this.options = options;
    }

    async exec(parameters) {
        throw new Error("not implemented");
    }

    async transferFile(parameters) {
        throw new Error("not implemented");
    }

    async createContainer(parameters) {
        throw new Error('abstract function called');
    }
};
