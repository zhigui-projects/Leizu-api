/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const org1 = {
    name: 'org1',
    mspId: 'Org1MSP',
    ca: {
        name: 'ca-org1',
        url: 'https://localhost:7054',
        enrollId: 'admin',
        enrollSecret: 'adminpw'
    },
    signIdentity: {
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
            'MIGHAgEBMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgS0L+WeTBa4vdUW4j\n' +
            'rogLu8JmLSjda0YcA2TWOfaR+8yhRANCAAQO41JsWQE2pt2UZ/DBdIcpa/inDZ4U\n' +
            '54P5VcIdXgISsEqdRcGLBz+cvvrpTNedaeyNRSndk5LMIJ/npw2Qua/p\n' +
            '-----END PRIVATE KEY-----',
        adminCert: '-----BEGIN CERTIFICATE-----\n' +
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
            '-----END CERTIFICATE-----',
    },
    peers: [{
        url: 'grpcs://localhost:7051',
        'server-hostname': 'peer0.org1.example.com',
    }]
};

const orderer = {
    name: 'org0',
    mspId: 'OrdererMSP',
    ca: {},
    signIdentity: {
        adminKey: '-----BEGIN PRIVATE KEY-----\n' +
            'MIGHAgEBMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgKi/7SbU0tzemhB4/\n' +
            'gZY1pts4cjYsrMTL7SSGkDSpSkahRANCAASkearIgWkEsdLMtSv+xBaQSQ3lTwun\n' +
            'C236iI47aLLjHzTYw61UfV/LPnTy3lm1D+aiZlpxNZGfydFsk56kWygN\n' +
            '-----END PRIVATE KEY-----',
    },
    peers: [{
        url: 'grpcs://localhost:7050',
        'server-hostname': 'orderer.example.com'
    }]

};

module.exports = {
    name: 'SampleConsortium',
    sysChannel: 'testchainid',
    discoverPeer: 'peer0.org1.example.com',
    orgs: [orderer, org1]
};
