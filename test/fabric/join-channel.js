let handler = require('../../src/services/fabric/join-channel');

var config = {
    org: {
        mspid: 'Org3MSP',
        peers: [{name: 'peer0.org3.example.com', url: 'grpcs://localhost:11051'},
            {name: 'peer1.org3.example.com', url: 'grpcs://localhost:12051'}],
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
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgjpRdw44zVzxjBbaH\n' +
        '1+ghbMV5eFUdQ8AFMBfzd/CZOHWhRANCAASugoASIlouQtjVinL+gHkjp+7HQ5Y4\n' +
        '3ihTy/7FYQGKmpz31jA6Db3lPWrUgTQpt6j2C0dMZ7TxRAqqJbiG26LT\n' +
        '-----END PRIVATE KEY-----\n',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
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
        '-----END CERTIFICATE-----\n'
    },
    orderConfig: {
        mspid: 'OrdererMSP',
        sysChannel: 'mychannel',
        url: 'grpcs://localhost:7050',
        'server-hostname': 'orderer.example.com',
        pem: '-----BEGIN CERTIFICATE-----\n' +
        'MIICNTCCAdygAwIBAgIRAN1F77OjzDmyWCzGuLyXHI8wCgYIKoZIzj0EAwIwbDEL\n' +
        'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
        'cmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRowGAYDVQQDExF0bHNjYS5l\n' +
        'eGFtcGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTlaMGwxCzAJ\n' +
        'BgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJh\n' +
        'bmNpc2NvMRQwEgYDVQQKEwtleGFtcGxlLmNvbTEaMBgGA1UEAxMRdGxzY2EuZXhh\n' +
        'bXBsZS5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQkmbjr/9EK0m/4CpR6\n' +
        'DiM+Eyke3vxPX+IhL+utTRt/qYz2q0UT9wem0xgRVqyWp4vN35ur7aSI+dALKBFT\n' +
        'RWPwo18wXTAOBgNVHQ8BAf8EBAMCAaYwDwYDVR0lBAgwBgYEVR0lADAPBgNVHRMB\n' +
        'Af8EBTADAQH/MCkGA1UdDgQiBCBqIR7RiIC02zhngxyXeAmQJxO44yGlq1XswQTa\n' +
        '/C7sSTAKBggqhkjOPQQDAgNHADBEAiBSxokO+9hHG+FpYikoNpcma4AK6N1KI2B6\n' +
        'WqI5xNyF4gIgIQx8Q6p6ynDfUGDJ43uTHPzwlt+o8gQ3A5w07L70ml0=\n' +
        '-----END CERTIFICATE-----\n',
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg33NMbWc5E80ueSIA\n' +
        'iWqRlyC2M+1ce4shkkP/CVKOp4uhRANCAASgMruzeEtmT0Es7AFRf5sMAnsLrvvj\n' +
        'LX3DJlHXqCDxUQY9STAp33/PDNMI9d4EEiUOhn51K0++hvy+XxsQlIn1\n' +
        '-----END PRIVATE KEY-----',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
        'MIICCjCCAbGgAwIBAgIRANPhTyHWZkTenKfX4eBv0ZUwCgYIKoZIzj0EAwIwaTEL\n' +
        'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
        'cmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRcwFQYDVQQDEw5jYS5leGFt\n' +
        'cGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTlaMFYxCzAJBgNV\n' +
        'BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNp\n' +
        'c2NvMRowGAYDVQQDDBFBZG1pbkBleGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqG\n' +
        'SM49AwEHA0IABKAyu7N4S2ZPQSzsAVF/mwwCewuu++MtfcMmUdeoIPFRBj1JMCnf\n' +
        'f88M0wj13gQSJQ6GfnUrT76G/L5fGxCUifWjTTBLMA4GA1UdDwEB/wQEAwIHgDAM\n' +
        'BgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIA1GzPDpQ2wbw7biv4DNsgLElDYE+Vxy\n' +
        '7g/4OdPsMAcZMAoGCCqGSM49BAMCA0cAMEQCIEdiGFLzeGMvVNubuZ3iuvRp/Pp6\n' +
        'im3FmABwIbnMarabAiBIHWzz8Yxh9K5ZNkVNZX3fLZ4LlzsKBinbWH9J2wblDg==\n' +
        '-----END CERTIFICATE-----\n'
    }
};


handler.joinChannel('mychannel', config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});