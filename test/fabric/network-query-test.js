'use strict';

const query = require("../src/services/fabric/network-query");

const peerConfig = {
    mspid: "Org1MSP",
    url: "grpcs://localhost:7051",
    'server-hostname': 'peer0.org1.example.com',
    pem: '-----BEGIN CERTIFICATE-----\n' +
    'MIICSDCCAe6gAwIBAgIRAPnKpS42wlgtHsddm6q+kYcwCgYIKoZIzj0EAwIwcDEL\n' +
    'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
    'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xGTAXBgNVBAMTEG9y\n' +
    'ZzEuZXhhbXBsZS5jb20wHhcNMTcwNDIyMTIwMjU2WhcNMjcwNDIwMTIwMjU2WjBw\n' +
    'MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2Fu\n' +
    'IEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQ\n' +
    'b3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABLi5341r\n' +
    'mriGFHCmVTLdgPGpDFRgwgmHSuLayMsGP0yEmsXh3hKAy24f1mjx/t8WT9G2sAdw\n' +
    'ONsPsfKMSCKpaRqjaTBnMA4GA1UdDwEB/wQEAwIBpjAZBgNVHSUEEjAQBgRVHSUA\n' +
    'BggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCCiLa81ayqrV5Lq\n' +
    'U+NfZvzO8dfxqis6K5Lb+/lqRI6iajAKBggqhkjOPQQDAgNIADBFAiEAr8LYCY2b\n' +
    'q5kNqOUxgHwBa2KTi/zJBR9L3IsTRDjJo8ECICf1xiDgKqZKrAMh0OCebskYwf53\n' +
    'dooG04HBoqBLvB8Q\n' +
    '-----END CERTIFICATE-----',
    adminKey: '-----BEGIN PRIVATE KEY-----\n' +
             'MIGHAgEBMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgS0L+WeTBa4vdUW4j\n' +
             'rogLu8JmLSjda0YcA2TWOfaR+8yhRANCAAQO41JsWQE2pt2UZ/DBdIcpa/inDZ4U\n' +
             '54P5VcIdXgISsEqdRcGLBz+cvvrpTNedaeyNRSndk5LMIJ/npw2Qua/p\n' +
             '-----END PRIVATE KEY-----',
    adminCert:'-----BEGIN CERTIFICATE-----\n' +
            'MIICKjCCAdGgAwIBAgIQIVQ6HvVnJP1qZ5YKfh50hzAKBggqhkjOPQQDAjBwMQsw\n' +
            'CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\n' +
            'YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQb3Jn\n' +
            'MS5leGFtcGxlLmNvbTAeFw0xNzA0MjIxMjAyNTZaFw0yNzA0MjAxMjAyNTZaMFsx\n' +
            'CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4g\n' +
            'RnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkwEwYH\n' +
            'KoZIzj0CAQYIKoZIzj0DAQcDQgAEDuNSbFkBNqbdlGfwwXSHKWv4pw2eFOeD+VXC\n' +
            'HV4CErBKnUXBiwc/nL766UzXnWnsjUUp3ZOSzCCf56cNkLmv6aNiMGAwDgYDVR0P\n' +
            'AQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMAwGA1UdEwEB/wQCMAAwKwYD\n' +
            'VR0jBCQwIoAgoi2vNWsqq1eS6lPjX2b8zvHX8aorOiuS2/v5akSOomowCgYIKoZI\n' +
            'zj0EAwIDRwAwRAIgbEqKoKrFuYQG0ndiX7dT7GKGlF17Skf8DYil9cqbp00CID5T\n' +
            'URQPp0/vJ3tldK0z9xjFvsSecj8aqnDvZvGz07/v\n' +
            '-----END CERTIFICATE-----'
}

const caConfig = {
    url: "https://localhost:7054",
    name: "ca-org1"
}

const orderConfig = {
    url: "grpcs://localhost:7050",
    pem: '-----BEGIN CERTIFICATE-----\n' +
        'MIICNDCCAdqgAwIBAgIRAIBOtq8vZiC0+uLSi2MIS4swCgYIKoZIzj0EAwIwZjEL\n' +
        'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n' +
        'cmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRQwEgYDVQQDEwtleGFtcGxl\n' +
        'LmNvbTAeFw0xNzA0MjIxMjAyNTZaFw0yNzA0MjAxMjAyNTZaMGYxCzAJBgNVBAYT\n' +
        'AlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNpc2Nv\n' +
        'MRQwEgYDVQQKEwtleGFtcGxlLmNvbTEUMBIGA1UEAxMLZXhhbXBsZS5jb20wWTAT\n' +
        'BgcqhkjOPQIBBggqhkjOPQMBBwNCAARD2rvgyAmhn8hpu82kAjX3QUg2iqCUPEe1\n' +
        'Q5CzD5MVv/dK5wrRgkcoMhJLe4HPxYbjV3rodm5Pwi5m3zMGkqNQo2kwZzAOBgNV\n' +
        'HQ8BAf8EBAMCAaYwGQYDVR0lBBIwEAYEVR0lAAYIKwYBBQUHAwEwDwYDVR0TAQH/\n' +
        'BAUwAwEB/zApBgNVHQ4EIgQg6q3lkIfG2X/PNQ6U83rZ8saSu2bxghSM5YlA3nCt\n' +
        '6c4wCgYIKoZIzj0EAwIDSAAwRQIhAL5Lgy7jZ2W74L6i0B23a3JD0W8TSYlTcqXb\n' +
        'RMSXlLIoAiB2glBl0wM/ITn5+tnHOnq2wrIGuYIiNbLK5oq2zf+gtA==\n' +
        '-----END CERTIFICATE-----',
    adminKey: '-----BEGIN PRIVATE KEY-----\n' +
             'MIGHAgEBMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgS0L+WeTBa4vdUW4j\n' +
             'rogLu8JmLSjda0YcA2TWOfaR+8yhRANCAAQO41JsWQE2pt2UZ/DBdIcpa/inDZ4U\n' +
             '54P5VcIdXgISsEqdRcGLBz+cvvrpTNedaeyNRSndk5LMIJ/npw2Qua/p\n' +
             '-----END PRIVATE KEY-----',
    adminCert:'-----BEGIN CERTIFICATE-----\n' +
            'MIICKjCCAdGgAwIBAgIQIVQ6HvVnJP1qZ5YKfh50hzAKBggqhkjOPQQDAjBwMQsw\n' +
            'CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\n' +
            'YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQb3Jn\n' +
            'MS5leGFtcGxlLmNvbTAeFw0xNzA0MjIxMjAyNTZaFw0yNzA0MjAxMjAyNTZaMFsx\n' +
            'CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4g\n' +
            'RnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkwEwYH\n' +
            'KoZIzj0CAQYIKoZIzj0DAQcDQgAEDuNSbFkBNqbdlGfwwXSHKWv4pw2eFOeD+VXC\n' +
            'HV4CErBKnUXBiwc/nL766UzXnWnsjUUp3ZOSzCCf56cNkLmv6aNiMGAwDgYDVR0P\n' +
            'AQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMAwGA1UdEwEB/wQCMAAwKwYD\n' +
            'VR0jBCQwIoAgoi2vNWsqq1eS6lPjX2b8zvHX8aorOiuS2/v5akSOomowCgYIKoZI\n' +
            'zj0EAwIDRwAwRAIgbEqKoKrFuYQG0ndiX7dT7GKGlF17Skf8DYil9cqbp00CID5T\n' +
            'URQPp0/vJ3tldK0z9xjFvsSecj8aqnDvZvGz07/v\n' +
            '-----END CERTIFICATE-----'
}

query.getChannels(peerConfig,caConfig).then(response => {
	for (let i = 0; i < response.channels.length; i++) {
		console.log('channel id: ' + response.channels[i].channel_id);
	}
});