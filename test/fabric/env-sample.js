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
        url: 'grpcs://39.106.149.201:7051',
        'server-hostname': 'peer-39-106-149-201.org3.example.com',
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
            '-----END CERTIFICATE-----\n',
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
            'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgM77Nw+ofsTJiqHKr\n' +
            'qT7fs7lF/1q7EFtsxCfhb7+CMkahRANCAASwlhH+jNunJHZ05oEb4gPYx6PnpqUm\n' +
            '/9gdEAwDTf0rs83xI7TYBDZeGwJzhooSt8Ujrm/B6RAfQcH96HQQUoqh\n' +
            '-----END PRIVATE KEY-----\n',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
            'MIICeTCCAh+gAwIBAgIUbAs3cMG6oteqO03fsPU7rOgEc9wwCgYIKoZIzj0EAwIw\n' +
            'fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n' +
            'biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK\n' +
            'BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTgxMTE1MDgyNjAw\n' +
            'WhcNMTkxMTE1MDgzMTAwWjAzMRwwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcz\n' +
            'MRMwEQYDVQQDEwphZG1pbi11c2VyMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n' +
            'sJYR/ozbpyR2dOaBG+ID2Mej56alJv/YHRAMA039K7PN8SO02AQ2XhsCc4aKErfF\n' +
            'I65vwekQH0HB/eh0EFKKoaOBxDCBwTAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/\n' +
            'BAIwADAdBgNVHQ4EFgQUzToIOFxFEl6QEG6t3Pvni/DzrjMwHwYDVR0jBBgwFoAU\n' +
            'F2dCPaqegj/ExR2fW8OZ0bWcSBAwYQYIKgMEBQYHCAEEVXsiYXR0cnMiOnsiaGYu\n' +
            'QWZmaWxpYXRpb24iOiJvcmczIiwiaGYuRW5yb2xsbWVudElEIjoiYWRtaW4tdXNl\n' +
            'ciIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZIzj0EAwIDSAAwRQIhALG26Dt4\n' +
            'Bbg6odzlNOh287W6EOMZw4aUHeM8yrTWp3t1AiBBU6YT3XOaccq3FfQjQdkZlYGk\n' +
            'VgYpBw35+k4wgo953g==\n' +
            '-----END CERTIFICATE-----\n',
        tlsKey: '-----BEGIN PRIVATE KEY-----\n' +
            'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg7gETAwoqUDf/Ug2Z\n' +
            'i2Dh0+oRkl2pZgKGfFiYexsVzdmhRANCAAQT7OYuASTKyzZmQMvXRAIdshkEQUQt\n' +
            '4d/6/3W/FdbQiARu3m1DHBAt062UXW5vgVY0yj3tNyfpjiMwW+K8VThZ\n' +
            '-----END PRIVATE KEY-----\n',
        tlsCert: '-----BEGIN CERTIFICATE-----\n' +
            'MIICyzCCAnKgAwIBAgIUAlutiQJ/FzvnKtVCid0qyzt5Q/kwCgYIKoZIzj0EAwIw\n' +
            'fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n' +
            'biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK\n' +
            'BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTgxMTE1MDU0NDAw\n' +
            'WhcNMTkxMTE1MDU0OTAwWjBNMRwwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcz\n' +
            'MS0wKwYDVQQDEyRwZWVyLTM5LTEwNi0xNDktMjAxLm9yZzMuZXhhbXBsZS5jb20w\n' +
            'WTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQT7OYuASTKyzZmQMvXRAIdshkEQUQt\n' +
            '4d/6/3W/FdbQiARu3m1DHBAt062UXW5vgVY0yj3tNyfpjiMwW+K8VThZo4H9MIH6\n' +
            'MA4GA1UdDwEB/wQEAwIDqDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIw\n' +
            'DAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUDUFDuwBhDYCXXHStcRpeGTJn640wHwYD\n' +
            'VR0jBBgwFoAUF2dCPaqegj/ExR2fW8OZ0bWcSBAwewYIKgMEBQYHCAEEb3siYXR0\n' +
            'cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmczIiwiaGYuRW5yb2xsbWVudElEIjoi\n' +
            'cGVlci0zOS0xMDYtMTQ5LTIwMS5vcmczLmV4YW1wbGUuY29tIiwiaGYuVHlwZSI6\n' +
            'ImNsaWVudCJ9fTAKBggqhkjOPQQDAgNHADBEAiAeexhyEu834hdlXvx2s06kea7b\n' +
            '9oAod9yJeba/yRAkmAIgLEAYQngG9Vtz9Q1baqEYosgf57FoCc2A6kN7T7fbaro=\n' +
            '-----END CERTIFICATE-----\n',
    }
};

module.exports = {
    name: 'sample-consortium',
    config: config
};