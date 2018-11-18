'use strict';

const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const archiver = require('archiver');
const stringUtil = require('../../libraries/string-util');
const cryptoConfig = require('../../env').cryptoConfig;
const logger = require('../../libraries/log4js').getLogger('CredentialHelper');

const certPath = {
    cacerts: 'cacerts',
    admincerts: 'admincerts',
    signcerts: 'signcerts',
    keystore: 'keystore',
    tlscacerts: 'tlscacerts',
    intermediatecerts: 'intermediatecerts',
    tlsintermediatecerts: 'tlsintermediatecerts'
};

module.exports.CERT_PATHS = certPath;

module.exports.CredentialHelper = class CredentialHelper {

    constructor(consortiumId, orgName) {
        this.dirName = path.join(cryptoConfig.path, consortiumId, orgName);
        this.archiveFileName = path.join(cryptoConfig.path, consortiumId, orgName + '.zip');
    }

    writeKeyStore(dirName, key) {
        if (!key) {
            logger.debug('write keystore failed, because content is empty');
            return;
        }
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, stringUtil.hash(key) + '_sk');
        this.writeFile(filePath, key);
    }

    writeMspCert(dirName, cert) {
        if (!cert) {
            logger.debug('write %s msp cert failed, because content is empty', dirName);
            return;
        }
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let filePath = path.join(dirName, 'cert.pem');
        this.writeFile(filePath, cert);
    }

    writeTlsCert(dirName, tls) {
        if (!tls) {
            logger.debug('write TLS cert failed, because tls content is empty');
            return;
        }
        if (this.isDirExists(dirName)) {
            this.removeDir(dirName);
        }
        this.createDir(dirName);
        let caPath = path.join(dirName, 'ca.pem');
        this.writeFile(caPath, tls.cacert);
        let filePath = path.join(dirName, 'server.crt');
        this.writeFile(filePath, tls.cert);
        let keyPath = path.join(dirName, 'server.key');
        this.writeFile(keyPath, tls.key);
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

    async zipDirectoryFiles(isPeer, peerName) {
        let archiveFileName = this.archiveFileName;
        let dirName = this.dirName;
        if (isPeer && isPeer === true) {
            archiveFileName = path.join(dirName, 'peers', peerName + '.zip');
            dirName = path.join(dirName, 'peers', peerName);
        }
        let output = fs.createWriteStream(archiveFileName);
        let archive = archiver('zip', {
            zlib: {level: 9}
        });
        archive.pipe(output);
        archive.directory(dirName, false);
        await archive.finalize();
        return dirName;
    }

};

// @param isPeer, 'peer-true' or 'org-false'
module.exports.storeCredentials = async (credential, isPeer) => {
    let credentialHelper = new module.exports.CredentialHelper(credential.consortiumId, credential.orgName);
    try {
        let dirName = credentialHelper.dirName;
        if (isPeer && isPeer === true) {
            dirName = path.join(dirName, 'peers', credential.peerName);
        }
        credentialHelper.writeKeyStore(path.join(dirName, 'msp', certPath.keystore), credential.adminKey);
        credentialHelper.writeMspCert(path.join(dirName, 'msp', certPath.cacerts), credential.rootCert);
        credentialHelper.writeMspCert(path.join(dirName, 'msp', certPath.tlscacerts), credential.tlsRootCert);
        credentialHelper.writeMspCert(path.join(dirName, 'msp', certPath.admincerts), credential.adminCert);
        credentialHelper.writeMspCert(path.join(dirName, 'msp', certPath.signcerts), credential.signcerts);
        credentialHelper.writeMspCert(path.join(dirName, 'msp', certPath.intermediatecerts), credential.intermediateCerts);
        credentialHelper.writeMspCert(path.join(dirName, 'msp', certPath.tlsintermediatecerts), credential.tlsintermediatecerts);
        credentialHelper.writeTlsCert(path.join(dirName, 'tls'), credential.tls);
        if (isPeer && isPeer === true) {
            return credentialHelper.zipDirectoryFiles(isPeer, credential.peerName);
        }
        return credentialHelper.dirName;
    } catch (e) {
        logger.error(e);
        return Promise.reject(`Failed storeCredentials: ${e}`);
    }
};
