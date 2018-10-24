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

const updateConfig = {
    opt: 'add', // 'del' or 'update'
    update: {
        mspid: 'org2MSP',
        tlscacerts: '-----BEGIN CERTIFICATE-----\n' +
        'MIICSjCCAfCgAwIBAgIRAJl8QtAz00ontY2NmrmyiqQwCgYIKoZIzj0EAwIwdjEL\n' +
        'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
        'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzMuZXhhbXBsZS5jb20xHzAdBgNVBAMTFnRs\n' +
        'c2NhLm9yZzMuZXhhbXBsZS5jb20wHhcNMTgxMDA2MDgwNDU4WhcNMjgxMDAzMDgw\n' +
        'NDU4WjB2MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UE\n' +
        'BxMNU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMy5leGFtcGxlLmNvbTEfMB0G\n' +
        'A1UEAxMWdGxzY2Eub3JnMy5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49\n' +
        'AwEHA0IABC34BManGNRClDHN4X5SY/JEfy3agiVwMRCJBC9EK1BBD9FvHUDAqJp7\n' +
        'CiXby1ZMl/swzkaaTajhfWb9jEFU09ujXzBdMA4GA1UdDwEB/wQEAwIBpjAPBgNV\n' +
        'HSUECDAGBgRVHSUAMA8GA1UdEwEB/wQFMAMBAf8wKQYDVR0OBCIEILmo8DIY+3UV\n' +
        '0dF1ZQl7j4ZyPsNrLnYhcf4utdGIHXzMMAoGCCqGSM49BAMCA0gAMEUCIQDyw7UE\n' +
        'bL12+Qz9oy5IrdwbP8NtYiK8vEvEooySQGrfXgIgb3MRordiU9buD/2lEZcSVtmB\n' +
        'PPQwIkEInSPpkoB9+KA=\n' +
        '-----END CERTIFICATE-----\n',
        admincerts: '-----BEGIN CERTIFICATE-----\n' +
        'MIICKjCCAdGgAwIBAgIRALcj26o6OFOS5LHjfdgfhDAwCgYIKoZIzj0EAwIwczEL\n' +
        'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
        'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzMuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\n' +
        'Lm9yZzMuZXhhbXBsZS5jb20wHhcNMTgxMDA2MDgwNDU4WhcNMjgxMDAzMDgwNDU4\n' +
        'WjBsMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\n' +
        'U2FuIEZyYW5jaXNjbzEPMA0GA1UECxMGY2xpZW50MR8wHQYDVQQDDBZBZG1pbkBv\n' +
        'cmczLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEroKAEiJa\n' +
        'LkLY1Ypy/oB5I6fux0OWON4oU8v+xWEBipqc99YwOg295T1q1IE0Kbeo9gtHTGe0\n' +
        '8UQKqiW4htui06NNMEswDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYD\n' +
        'VR0jBCQwIoAgdcgfdMspO2Ou9tx6KKT61DGDA1SlvaqWeb55ZU0qy3YwCgYIKoZI\n' +
        'zj0EAwIDRwAwRAIgVb9bLoB+c1QRQocA/iMzzDOfHyPz6U0POoDKNGg4Th0CIGHd\n' +
        'M6g3kVMHPjL6fWFcnYFKu62+eUJ9OSZsPNDPvmtv\n' +
        '-----END CERTIFICATE-----\n',
        cacerts: '-----BEGIN CERTIFICATE-----\n' +
        'MIICQzCCAemgAwIBAgIQWLj280UcnQvFGCf2Tr0dPTAKBggqhkjOPQQDAjBzMQsw\n' +
        'CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\n' +
        'YW5jaXNjbzEZMBcGA1UEChMQb3JnMy5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\n' +
        'b3JnMy5leGFtcGxlLmNvbTAeFw0xODEwMDYwODA0NThaFw0yODEwMDMwODA0NTha\n' +
        'MHMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\n' +
        'YW4gRnJhbmNpc2NvMRkwFwYDVQQKExBvcmczLmV4YW1wbGUuY29tMRwwGgYDVQQD\n' +
        'ExNjYS5vcmczLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n' +
        'tcoosNH74YzEAVzQgAEj1fdg44WTkIP+znESaLljB+wUH8UvxII4/QfY8Y1TUox0\n' +
        'FTo3AgsC63SjFwbwYu0UWqNfMF0wDgYDVR0PAQH/BAQDAgGmMA8GA1UdJQQIMAYG\n' +
        'BFUdJQAwDwYDVR0TAQH/BAUwAwEB/zApBgNVHQ4EIgQgdcgfdMspO2Ou9tx6KKT6\n' +
        '1DGDA1SlvaqWeb55ZU0qy3YwCgYIKoZIzj0EAwIDSAAwRQIhAJja1hwHrOmcVPHu\n' +
        'uZ7i/masEj0AjyUf003Gi1EWNeMkAiAhpzkG353VLF/1SDAB7AyvV1oQYA/xxoSv\n' +
        'Kmt4yhjYJQ==\n' +
        '-----END CERTIFICATE-----\n'
    }
};

module.exports = {
    name: 'sample-consortium',
    config: {
        peerConfig: peerConfig,
        caConfig: caConfig,
        ordererConfig: ordererConfig,
        ordererCaConfig: ordererCaConfig,
    },
    updateConfig: updateConfig
};