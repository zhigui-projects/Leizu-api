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
    adminCert:'-----BEGIN CERTIFICATE-----\n' +
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

module.exports = {
    name: 'sample-consortium',
    config: {
        peerConfig: peerConfig,
        caConfig: caConfig
    }
};
