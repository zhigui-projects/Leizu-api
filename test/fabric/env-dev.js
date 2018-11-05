'use strict';

const peerConfig = {
    mspid: 'org1MSP',
    url: 'grpcs://47.94.200.47:7051',
    'server-hostname': 'peer1-org1',
    adminKey: '-----BEGIN PRIVATE KEY-----\n' +
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgBqtzMHSq6QYYOmJf\n' +
    't7w1ljSNYOyibJO3uouqEVJKVTmhRANCAASMj+g8mYUxaZTL4eX4wsc3Xp9NrY3/\n' +
    'upqXPBqXoDyhWf+Kwf/FyMAhfgl+w0TN8nL3kSNwcvoYo7DPFbYDdd0G\n' +
    '-----END PRIVATE KEY-----',
    adminCert: '-----BEGIN CERTIFICATE-----\n' +
    'MIIC5DCCAougAwIBAgIUDMcjP/ItUxDABP2kg8i4Bi3SrP8wCgYIKoZIzj0EAwIw\n' +
    'ZjELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\n' +
    'EwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGY2xpZW50MRcwFQYDVQQDEw5yY2Etb3Jn\n' +
    'MS1hZG1pbjAeFw0xODEwMTAwODA5MDBaFw0xOTEwMTAwODE0MDBaMG8xCzAJBgNV\n' +
    'BAYTAlVTMRcwFQYDVQQIEw5Ob3J0aCBDYXJvbGluYTEUMBIGA1UEChMLSHlwZXJs\n' +
    'ZWRnZXIxHDANBgNVBAsTBmNsaWVudDALBgNVBAsTBG9yZzExEzARBgNVBAMTCmFk\n' +
    'bWluLW9yZzEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASMj+g8mYUxaZTL4eX4\n' +
    'wsc3Xp9NrY3/upqXPBqXoDyhWf+Kwf/FyMAhfgl+w0TN8nL3kSNwcvoYo7DPFbYD\n' +
    'dd0Go4IBDDCCAQgwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0O\n' +
    'BBYEFAoSDrDPDzYA1xZbR+tHHvR865AoMB8GA1UdIwQYMBaAFBOssezdua3JFeEN\n' +
    'vF6HhZTFMjy8MCIGA1UdEQQbMBmCF2laMnplMWhja3V2ZzV0YzdqOWF0b2VaMIGD\n' +
    'BggqAwQFBgcIAQR3eyJhdHRycyI6eyJhYmFjLmluaXQiOiJ0cnVlIiwiYWRtaW4i\n' +
    'OiJ0cnVlIiwiaGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElE\n' +
    'IjoiYWRtaW4tb3JnMSIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZIzj0EAwID\n' +
    'RwAwRAIgNl2zrA5YNdbF85zM9I2QIFE3tyMtsB3XR+82r86sQ7sCIDWx55Pf1FJU\n' +
    '3I98OZ9edbFPagEjfzqFVbT32QwNjWak\n' +
    '-----END CERTIFICATE-----'
};

const caConfig = {
    url: 'https://59.110.164.211:7057',
    name: 'ica-org1',
    enrollId: 'user-org1',
    enrollSecret: 'user-org1pw'
};

// const peerConfig = {
//     mspid: 'org3MSP',
//     url: 'grpcs://39.106.149.201:7051',
//     'server-hostname': 'peer1-org3',
//     adminKey: '-----BEGIN PRIVATE KEY-----\n' +
//     'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgx63z7D2OOMw/G403\n' +
//     'x+wRGrhIlg9Q8cxMVrQ/SSAHrcChRANCAAT3ryRZ2OEqHyf1K414c7cWp+mhAIwB\n' +
//     'uwP6REKE9JOWH2prlF/cHX5If+59+k1ziO1FL3lZxV83PwZrP1b+9mGD\n' +
//     '-----END PRIVATE KEY-----',
//     adminCert: '-----BEGIN CERTIFICATE-----\n' +
//     'MIIC5DCCAougAwIBAgIUT+yx0bqGxTanUbDcxd0aXXaDHjQwCgYIKoZIzj0EAwIw\n' +
//     'ZjELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\n' +
//     'EwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGY2xpZW50MRcwFQYDVQQDEw5yY2Etb3Jn\n' +
//     'My1hZG1pbjAeFw0xODEwMzAwODIwMDBaFw0xOTEwMzAwODI1MDBaMG8xCzAJBgNV\n' +
//     'BAYTAlVTMRcwFQYDVQQIEw5Ob3J0aCBDYXJvbGluYTEUMBIGA1UEChMLSHlwZXJs\n' +
//     'ZWRnZXIxHDANBgNVBAsTBmNsaWVudDALBgNVBAsTBG9yZzExEzARBgNVBAMTCmFk\n' +
//     'bWluLW9yZzMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT3ryRZ2OEqHyf1K414\n' +
//     'c7cWp+mhAIwBuwP6REKE9JOWH2prlF/cHX5If+59+k1ziO1FL3lZxV83PwZrP1b+\n' +
//     '9mGDo4IBDDCCAQgwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0O\n' +
//     'BBYEFBKyLoGiZFN7Z9dNitVRI0h/EQJMMB8GA1UdIwQYMBaAFAexdd98JxIgr+Rj\n' +
//     'BR9QepajO1mVMCIGA1UdEQQbMBmCF2laMnplZml6bm0wc2lraHR3NWZvbGtaMIGD\n' +
//     'BggqAwQFBgcIAQR3eyJhdHRycyI6eyJhYmFjLmluaXQiOiJ0cnVlIiwiYWRtaW4i\n' +
//     'OiJ0cnVlIiwiaGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElE\n' +
//     'IjoiYWRtaW4tb3JnMyIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZIzj0EAwID\n' +
//     'RwAwRAIgcWl3RWE61911JWFemBCLfVtltVNMQ/95QAyT56kB3LQCIC+FQm+MMi4R\n' +
//     'It51iTV7kEi6O1LXKHN0aBlZqGXdV4AX\n' +
//     '-----END CERTIFICATE-----'
// };
//
// const caConfig = {
//     url: 'https://39.106.149.201:7054',
//     name: 'ica-org3',
//     enrollId: 'admin-org3',
//     enrollSecret: 'admin-org3pw'
// };

const ordererConfig = {
    mspid: 'org0MSP',
    url: 'grpcs://47.94.200.47:7050',
    'server-hostname': 'orderer1-org0'
};

const ordererCaConfig = {
    url: 'https://59.110.164.211:7056',
    name: 'ica-org0',
    enrollId: 'admin-org0',
    enrollSecret: 'admin-org0pw'
};

module.exports = {
    name: 'sample-consortium',
    config: {
        peerConfig: peerConfig,
        caConfig: caConfig,
        ordererConfig: ordererConfig,
        ordererCaConfig: ordererCaConfig,
    }
};