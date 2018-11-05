'use strict';

const fs = require('fs');
const path = require('path');

module.exports.CERT_PATHS = {
    cacerts: "cacerts",
    admincerts: "admincerts",
    signcerts: "signcerts",
    keystore: "keystore",
    tlscacerts: "tlscacerts"
};

module.exports.CredentialHelper = class {

    constructor(mspId){
        this.mspId = mspId;
        this.dirName = path.join(__dirname,mspId);
    }

    writeCaCerts(caCert){


    }

    writeAdminCerts(adminCert){

    }

    writeSignCerts(signCert){

    }

    writeTlsCert(tlsCerts){

    }

    writeKeys(key){

    }
    
    isDirExists(dirName){

    }

    removeDir(dirName){

    }

    createDir(dirName){

    }

    writeFile(filePath, fileContent){

    }

    removeFile(filePath){

    }

    zipDirectoryFiles(){

    }

};