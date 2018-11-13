'use strict';

var config = {
    peerConfig: {
        mspid: 'Org1MSP',
        url: 'grpcs://39.106.149.201:7051',
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
        '-----END CERTIFICATE-----\n',
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgNmsvQQm4nwrxOKFX\n' +
        'UNfLPgjNm+FtYu3vb6OZ9q/5GbChRANCAAQKZvNQOjMissqOnc4DMi1IbubsWXDv\n' +
        'qtPxU7wTqi2ULDEq0FGQ+lkvueisLc2yPITff0nk7ilcKqEgClDJFGxG\n' +
        '-----END PRIVATE KEY-----\n',
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
        '-----END CERTIFICATE-----\n'
    },
    caConfig: {
        url: 'https://39.106.149.201:7080',
        name: 'ca-org3',
        enrollId: 'admin',
        enrollSecret: 'adminpw'
    },
    orderConfig: {
        mspid: 'OrdererMSP',
        sysChannel: 'testchainid',
        url: 'grpcs://39.106.149.201:7050',
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
        '-----END CERTIFICATE-----\n'
    },
    newConfig: {
        mspid: 'Org3MSP',
        url: 'grpcs://39.106.149.201:9051',
        'server-hostname': 'peer0-org3',
        pem: '-----BEGIN CERTIFICATE-----\n' +
        'MIICYjCCAgmgAwIBAgIUB3CTDOU47sUC5K4kn/Caqnh114YwCgYIKoZIzj0EAwIw\n' +
        'fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n' +
        'biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK\n' +
        'BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTYxMDEyMTkzMTAw\n' +
        'WhcNMjExMDExMTkzMTAwWjB/MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZv\n' +
        'cm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEfMB0GA1UEChMWSW50ZXJuZXQg\n' +
        'V2lkZ2V0cywgSW5jLjEMMAoGA1UECxMDV1dXMRQwEgYDVQQDEwtleGFtcGxlLmNv\n' +
        'bTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABKIH5b2JaSmqiQXHyqC+cmknICcF\n' +
        'i5AddVjsQizDV6uZ4v6s+PWiJyzfA/rTtMvYAPq/yeEHpBUB1j053mxnpMujYzBh\n' +
        'MA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQXZ0I9\n' +
        'qp6CP8TFHZ9bw5nRtZxIEDAfBgNVHSMEGDAWgBQXZ0I9qp6CP8TFHZ9bw5nRtZxI\n' +
        'EDAKBggqhkjOPQQDAgNHADBEAiAHp5Rbp9Em1G/UmKn8WsCbqDfWecVbZPQj3RK4\n' +
        'oG5kQQIgQAe4OOKYhJdh3f7URaKfGTf492/nmRmtK+ySKjpHSrU=\n' +
        '-----END CERTIFICATE-----',
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
        'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQghwv7QJb/GAk8Ar8M\n' +
        'B4JEtYyLdz5kcvbEsan3lG+LWMGhRANCAASLMxFd84No1Dt867SnyAe358qbC2Sv\n' +
        'gITN3Hj54mhLNSa5LV18GDoRIiaWKMY3VJwzubQntlYRKBiwmMNQDkec\n' +
        '-----END PRIVATE KEY-----\n',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
        'MIICeTCCAh+gAwIBAgIUIEzi/gLe7po2G+QWEDuSZjiIc1AwCgYIKoZIzj0EAwIw\n' +
        'fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n' +
        'biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK\n' +
        'BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTgxMTEyMTcwNzAw\n' +
        'WhcNMTkxMTEyMTcxMjAwWjAzMRwwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcz\n' +
        'MRMwEQYDVQQDEwphZG1pbi11c2VyMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n' +
        'izMRXfODaNQ7fOu0p8gHt+fKmwtkr4CEzdx4+eJoSzUmuS1dfBg6ESImlijGN1Sc\n' +
        'M7m0J7ZWESgYsJjDUA5HnKOBxDCBwTAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/\n' +
        'BAIwADAdBgNVHQ4EFgQUQTA+wncBg+UvGNF9BCkbbPy+0JgwHwYDVR0jBBgwFoAU\n' +
        'F2dCPaqegj/ExR2fW8OZ0bWcSBAwYQYIKgMEBQYHCAEEVXsiYXR0cnMiOnsiaGYu\n' +
        'QWZmaWxpYXRpb24iOiJvcmczIiwiaGYuRW5yb2xsbWVudElEIjoiYWRtaW4tdXNl\n' +
        'ciIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZIzj0EAwIDSAAwRQIhAMUpQh8v\n' +
        'NZ01QoZwRlDGencUck711oZqixgEiSdzZ41EAiAPFYlG/1MaqUaTRZ4lDIj2TQJr\n' +
        'JUth1vdiRfwp9N8dUQ==\n' +
        '-----END CERTIFICATE-----\n'
    }
};

module.exports = {
    name: 'sample-consortium',
    config: config
};