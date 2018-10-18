let handler = require('../../src/services/fabric/update-channel');

var config = {
    peerConfig: {
        mspid: 'Org1MSP',
        url: 'grpcs://localhost:7051',
        'server-hostname': 'peer0.org1.example.com',
        pem: '-----BEGIN CERTIFICATE-----\n' +
        'MIICSTCCAe+gAwIBAgIQZrCrf6SF3Z/w7z3PwCNaaTAKBggqhkjOPQQDAjB2MQsw\n' +
        'CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\n' +
        'YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEfMB0GA1UEAxMWdGxz\n' +
        'Y2Eub3JnMS5leGFtcGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMz\n' +
        'MTlaMHYxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH\n' +
        'Ew1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBvcmcxLmV4YW1wbGUuY29tMR8wHQYD\n' +
        'VQQDExZ0bHNjYS5vcmcxLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0D\n' +
        'AQcDQgAEq4HHYbyF3O3iX+bt7tATNgdrWW6GYXWfKKJjsriBMhtYr5y/sTjvg64s\n' +
        'Z517Nx/QNj26yKLdZ9vSBUGhAUfedaNfMF0wDgYDVR0PAQH/BAQDAgGmMA8GA1Ud\n' +
        'JQQIMAYGBFUdJQAwDwYDVR0TAQH/BAUwAwEB/zApBgNVHQ4EIgQglFCS2Tb1g4xa\n' +
        'b2SE25dNhXkzcGc30A0Ev2X3Tjl2+fgwCgYIKoZIzj0EAwIDSAAwRQIhANDFPsDw\n' +
        '14ftcZgQtMQ0yuMg8cCHj246rhsrnjwar7aAAiBwLG+4sKnTOOa+ceK6p+PpKu6F\n' +
        'qwkrkz69kT1ZsL7SXw==\n' +
        '-----END CERTIFICATE-----',
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgNmsvQQm4nwrxOKFX\n' +
        'UNfLPgjNm+FtYu3vb6OZ9q/5GbChRANCAAQKZvNQOjMissqOnc4DMi1IbubsWXDv\n' +
        'qtPxU7wTqi2ULDEq0FGQ+lkvueisLc2yPITff0nk7ilcKqEgClDJFGxG\n' +
        '-----END PRIVATE KEY-----',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
        'MIICGTCCAb+gAwIBAgIQKKKdQSzsDoUYn/LPAuRWGTAKBggqhkjOPQQDAjBzMQsw\n' +
        'CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\n' +
        'YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\n' +
        'b3JnMS5leGFtcGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTla\n' +
        'MFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\n' +
        'YW4gRnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkw\n' +
        'EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAECmbzUDozIrLKjp3OAzItSG7m7Flw76rT\n' +
        '8VO8E6otlCwxKtBRkPpZL7norC3NsjyE339J5O4pXCqhIApQyRRsRqNNMEswDgYD\n' +
        'VR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgDnKSJOiz8xeE\n' +
        'yKk8W4729MHJHZ5uV3xFwzFjYJ/kABEwCgYIKoZIzj0EAwIDSAAwRQIhALT02pc/\n' +
        'yfE/4wUJfUBQ32GifUEh8JktAXzL/73S0rjYAiACNSp6zAQBX9SBxTOGMk4cGGAy\n' +
        'CKqf8052NVUs2CvPzA==\n' +
        '-----END CERTIFICATE-----'
    },
    signOrg: {
        mspid: 'Org2MSP',
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgHa4xvmGVQJV5wrMj\n' +
        'KttcA0hh/Yz0dezmXlRLjNk9HyahRANCAATCyh15tcTe05OGM2loOBmIS6MjY647\n' +
        'Od9NqN+5tdlPC6K0eyC+X3RYGCC3i+F1D4wv0BuBNqOoT5d7mT1FRK22\n' +
        '-----END PRIVATE KEY-----',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
        'MIICGjCCAcCgAwIBAgIRAIUbkOONvaq2DLJr9qZbDKwwCgYIKoZIzj0EAwIwczEL\n' +
        'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
        'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzIuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\n' +
        'Lm9yZzIuZXhhbXBsZS5jb20wHhcNMTcwNjIzMTIzMzE5WhcNMjcwNjIxMTIzMzE5\n' +
        'WjBbMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\n' +
        'U2FuIEZyYW5jaXNjbzEfMB0GA1UEAwwWQWRtaW5Ab3JnMi5leGFtcGxlLmNvbTBZ\n' +
        'MBMGByqGSM49AgEGCCqGSM49AwEHA0IABMLKHXm1xN7Tk4YzaWg4GYhLoyNjrjs5\n' +
        '302o37m12U8LorR7IL5fdFgYILeL4XUPjC/QG4E2o6hPl3uZPUVErbajTTBLMA4G\n' +
        'A1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIKfUfvpGproH\n' +
        'cwyFD+0sE3XfJzYNcif0jNwvgOUFZ4AFMAoGCCqGSM49BAMCA0gAMEUCIQDa1k6R\n' +
        '+luypvng6JMSKIyibptkwICToEAZlDqLeD+k1gIgGFXm1+p1QqxViOa+c1dUvjl0\n' +
        'm1UCqGDwNTHDm5mO+es=\n' +
        '-----END CERTIFICATE-----'
    },
    addOrg: {
        mspid: 'Org3MSP',
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
    },
    caConfig: {
        url: 'https://localhost:7054',
        name: 'ca-org1',
        enrollId: 'admin',
        enrollSecret: 'adminpw'
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

handler.updateChannel({
    opt: 'add' // 'del' or 'update'
}, config).then(result => {
    console.log(result);
}, err => {
    console.log(err);
});