'use strict';

const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const archiver = require('archiver');
const stringUtil = require('../../libraries/string-util');
const logger = require('../../libraries/log4js').getLogger('CredentialHelper');

module.exports.CERT_PATHS = {
    cacerts: 'cacerts',
    admincerts: 'admincerts',
    signcerts: 'signcerts',
    keystore: 'keystore',
    tlscacerts: 'tlscacerts'
};

module.exports.CredentialHelper = class CredentialHelper {

    constructor(consortiumId, orgName) {
        this.dirName = path.join('/tmp/crypto-config', consortiumId, orgName);
        this.archiveFileName = path.join('/tmp/crypto-config', consortiumId, orgName + '.zip');
    }

    writeCaCerts(caCert) {
        let dirName = path.join(this.dirName, exports.CERT_PATHS.cacerts);
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, 'ca-cert.pem');
        this.writeFile(filePath, caCert);
    }

    writeTlsCaCerts(caCert) {
        let dirName = path.join(this.dirName, exports.CERT_PATHS.tlscacerts);
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, 'cert.pem');
        this.writeFile(filePath, caCert);
    }

    writeAdminCerts(adminCert) {
        let dirName = path.join(this.dirName, exports.CERT_PATHS.admincerts);
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, 'admin-cert.pem');
        this.writeFile(filePath, adminCert);
    }

    writeSignCerts(signCert) {
        let dirName = path.join(this.dirName, exports.CERT_PATHS.signcerts);
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, 'sign-cert.pem');
        this.writeFile(filePath, signCert);
    }

    writeTlsCert(tls) {
        if (!tls) {
            logger.warn('Failed to write TLS cert because tls content is empty');
            return;
        }
        let dirName = path.join(this.dirName, 'tls');
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, 'cert.pem');
        this.writeFile(filePath, tls.cert);
        let keyPath = path.join(dirName, 'key.pem');
        this.writeFile(keyPath, tls.key);
    }

    writeKey(key) {
        let dirName = path.join(this.dirName, exports.CERT_PATHS.keystore);
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, stringUtil.hash(key) + '.pem');
        this.writeFile(filePath, key);
    }

    isDirExists(dirName) {
        return fs.existsSync(dirName);
    }

    removeDir(dirName) {
        shell.rm('-rf', dirName);
    }

    createDir(dirpath, mode) {
        try {
            let pathTmp;
            dirpath.split(/[/\\]/).forEach(async function (dirName) {
                if (!pathTmp && dirName === '') {
                    pathTmp = '/';
                }
                pathTmp = path.join(pathTmp, dirName);
                if (!fs.existsSync(pathTmp)) {
                    fs.mkdirSync(pathTmp, mode);
                }
            });
        } catch (e) {
            throw e;
        }
    }

    writeFile(filePath, fileContent) {
        fs.writeFileSync(filePath, fileContent);
    }

    removeFile(filePath) {
        fs.unlinkSync(filePath);
    }

    async zipDirectoryFiles() {
        let output = fs.createWriteStream(this.archiveFileName);
        let archive = archiver('zip', {
            zlib: {level: 9}
        });
        archive.pipe(output);
        archive.directory(this.dirName, false);
        await archive.finalize();
    }

};

module.exports.storeCredentials = async (credential) => {
    let credentialHelper = new module.exports.CredentialHelper(credential.consortiumId, credential.orgName);
    try {
        credentialHelper.writeCaCerts(credential.rootCert);
        credentialHelper.writeTlsCaCerts(credential.rootCert);
        credentialHelper.writeAdminCerts(credential.adminCert);
        credentialHelper.writeKey(credential.signkey || credential.adminKey);
        credentialHelper.writeSignCerts(credential.signCert || credential.adminCert);
        credentialHelper.writeTlsCert(credential.tls);
        await credentialHelper.zipDirectoryFiles();
        return credentialHelper.dirName;
    } catch (e) {
        logger.error(e);
        return Promise.reject(`Failed storeCredentials: ${e}`);
    }
};
