'use strict';

const CACERTS = "cacerts";
const ADMINCERTS = "admincerts";
const TLSCACERTS = "tlscacerts";

var MSP = class {
    constructor(config) {
        this.mspid = config.mspid;
        this.config = null;
        this.load(config);
    }

    load(config) {
        var cacerts = MSP.getPemMaterial(config[CACERTS]);
        if (cacerts == null || cacerts.length == 0) {
            throw new Error('Missing cacerts for MSP');
        }

        var admincert = MSP.getPemMaterial(config[ADMINCERTS]);
        if (admincert == null || admincert.length == 0) {
            throw new Error('Missing admincerts for MSP');
        }

        var tmpcfg = {};
        tmpcfg.admins = admincert;
        tmpcfg.root_certs = cacerts;

        var tlscacerts = MSP.getPemMaterial(config[TLSCACERTS]);
        if (tlscacerts != null && tlscacerts.length > 0) {
            tmpcfg.tls_root_certs = tlscacerts;
        }

        tmpcfg.crypto_config = MSP.getDefaultCryptoConfig();
        tmpcfg.name = this.mspid;

        this.config = tmpcfg;
    }

    getConfig() {
        return this.config;
    }

    getMSP() {
        var msp = {};
        msp.mod_policy = "Admins";
        msp.value = {};
        msp.value.config = this.getConfig();

        return msp;
    }

    static getDefaultCryptoConfig() {
        var cryptocfg = {};
        cryptocfg['identity_identifier_hash_function'] = 'SHA256';
        cryptocfg['signature_hash_family'] = 'SHA2';

        return cryptocfg;
    }

    static getPemMaterial(pem) {
        if (pem) {
            var certs = [];
            certs.push(Buffer.from(pem).toString('base64'));
            return certs;
        } else {
            return null;
        }
    }
};

module.exports = MSP;
