const Client = require('fabric-client');
const fs = require("fs");
const path = require("path");

const channelName = "adminconfig";
var networkConfig = {
    version: "1.0",
    channels: {
        adminconfig: {
            orderers: ['orderer.example.com'],
            peers: {
                'peer0.org1.example.com:': {
                    endorsingPeer: true,
                    chaincodeQuery: true
                }
            }
        }
    },
    orderers:{
        'orderer.example.com': {
            url: "grpcs://localhost:7050",
            grpcOptions: {
                'ssl-target-name-override': 'orderer.example.com'
            },
            tlsCACerts: {
                pem:'-----BEGIN CERTIFICATE-----' +
                    'MIICNDCCAdqgAwIBAgIRAIBOtq8vZiC0+uLSi2MIS4swCgYIKoZIzj0EAwIwZjEL' +
                    'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG' +
                    'cmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRQwEgYDVQQDEwtleGFtcGxl' +
                    'LmNvbTAeFw0xNzA0MjIxMjAyNTZaFw0yNzA0MjAxMjAyNTZaMGYxCzAJBgNVBAYT' +
                    'AlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNpc2Nv' +
                    'MRQwEgYDVQQKEwtleGFtcGxlLmNvbTEUMBIGA1UEAxMLZXhhbXBsZS5jb20wWTAT' +
                    'BgcqhkjOPQIBBggqhkjOPQMBBwNCAARD2rvgyAmhn8hpu82kAjX3QUg2iqCUPEe1' +
                    'Q5CzD5MVv/dK5wrRgkcoMhJLe4HPxYbjV3rodm5Pwi5m3zMGkqNQo2kwZzAOBgNV' +
                    'HQ8BAf8EBAMCAaYwGQYDVR0lBBIwEAYEVR0lAAYIKwYBBQUHAwEwDwYDVR0TAQH/' +
                    'BAUwAwEB/zApBgNVHQ4EIgQg6q3lkIfG2X/PNQ6U83rZ8saSu2bxghSM5YlA3nCt' +
                    '6c4wCgYIKoZIzj0EAwIDSAAwRQIhAL5Lgy7jZ2W74L6i0B23a3JD0W8TSYlTcqXb' +
                    'RMSXlLIoAiB2glBl0wM/ITn5+tnHOnq2wrIGuYIiNbLK5oq2zf+gtA==' +
                    '-----END CERTIFICATE-----'
            }
        }
    },
    peers:{
       'peer0.org1.example.com':{
           url: "grpcs://localhost:7051",
           eventUrl: "grpcs://localhost:7053",
           grpcOptions:{
               'ssl-target-name-override': "peer0.org1.example.com"
           },
           tlsCACerts:{
               pem: '-----BEGIN CERTIFICATE-----' +
                    'MIICSDCCAe6gAwIBAgIRAPnKpS42wlgtHsddm6q+kYcwCgYIKoZIzj0EAwIwcDEL' +
                    'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG' +
                    'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xGTAXBgNVBAMTEG9y' +
                    'ZzEuZXhhbXBsZS5jb20wHhcNMTcwNDIyMTIwMjU2WhcNMjcwNDIwMTIwMjU2WjBw' +
                    'MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2Fu' +
                    'IEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQ' +
                    'b3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABLi5341r' +
                    'mriGFHCmVTLdgPGpDFRgwgmHSuLayMsGP0yEmsXh3hKAy24f1mjx/t8WT9G2sAdw' +
                    'ONsPsfKMSCKpaRqjaTBnMA4GA1UdDwEB/wQEAwIBpjAZBgNVHSUEEjAQBgRVHSUA' +
                    'BggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCCiLa81ayqrV5Lq' +
                    'U+NfZvzO8dfxqis6K5Lb+/lqRI6iajAKBggqhkjOPQQDAgNIADBFAiEAr8LYCY2b' +
                    'q5kNqOUxgHwBa2KTi/zJBR9L3IsTRDjJo8ECICf1xiDgKqZKrAMh0OCebskYwf53' +
                    'dooG04HBoqBLvB8Q' +
                    '-----END CERTIFICATE-----'
           }
       } 
    },
    organizations:{
        Org1:{
            mspid: "Org1MSP",
            peers: ["peer0.org1.example.com"],
            certificateAuthorities: ["ca-org1"],
            adminPrivateKey:{
                pem: '-----BEGIN PRIVATE KEY-----' +
                     'MIGHAgEBMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgS0L+WeTBa4vdUW4j' +
                     'rogLu8JmLSjda0YcA2TWOfaR+8yhRANCAAQO41JsWQE2pt2UZ/DBdIcpa/inDZ4U' +
                     '54P5VcIdXgISsEqdRcGLBz+cvvrpTNedaeyNRSndk5LMIJ/npw2Qua/p' +
                     '-----END PRIVATE KEY-----'
            },
            signedCert:{
                pem: '-----BEGIN CERTIFICATE-----' +
                    'MIICKjCCAdGgAwIBAgIQIVQ6HvVnJP1qZ5YKfh50hzAKBggqhkjOPQQDAjBwMQsw' +
                    'CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy' +
                    'YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQb3Jn' +
                    'MS5leGFtcGxlLmNvbTAeFw0xNzA0MjIxMjAyNTZaFw0yNzA0MjAxMjAyNTZaMFsx' +
                    'CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4g' +
                    'RnJhbmNpc2NvMR8wHQYDVQQDDBZBZG1pbkBvcmcxLmV4YW1wbGUuY29tMFkwEwYH' +
                    'KoZIzj0CAQYIKoZIzj0DAQcDQgAEDuNSbFkBNqbdlGfwwXSHKWv4pw2eFOeD+VXC' +
                    'HV4CErBKnUXBiwc/nL766UzXnWnsjUUp3ZOSzCCf56cNkLmv6aNiMGAwDgYDVR0P' +
                    'AQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMAwGA1UdEwEB/wQCMAAwKwYD' +
                    'VR0jBCQwIoAgoi2vNWsqq1eS6lPjX2b8zvHX8aorOiuS2/v5akSOomowCgYIKoZI' +
                    'zj0EAwIDRwAwRAIgbEqKoKrFuYQG0ndiX7dT7GKGlF17Skf8DYil9cqbp00CID5T' +
                    'URQPp0/vJ3tldK0z9xjFvsSecj8aqnDvZvGz07/v' +
                    '-----END CERTIFICATE-----'
            }
        }
    },
    certificateAuthorities: {
        'ca-org1':{
            url: "https://localhost:7054",
            httpOptions: {
                verify: false
            },
            tlsCACerts:{
                pem:'-----BEGIN CERTIFICATE-----' +
                    'MIICSDCCAe6gAwIBAgIRAPnKpS42wlgtHsddm6q+kYcwCgYIKoZIzj0EAwIwcDEL' +
                    'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG' +
                    'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xGTAXBgNVBAMTEG9y' +
                    'ZzEuZXhhbXBsZS5jb20wHhcNMTcwNDIyMTIwMjU2WhcNMjcwNDIwMTIwMjU2WjBw' +
                    'MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2Fu' +
                    'IEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQ' +
                    'b3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABLi5341r' +
                    'mriGFHCmVTLdgPGpDFRgwgmHSuLayMsGP0yEmsXh3hKAy24f1mjx/t8WT9G2sAdw' +
                    'ONsPsfKMSCKpaRqjaTBnMA4GA1UdDwEB/wQEAwIBpjAZBgNVHSUEEjAQBgRVHSUA' +
                    'BggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCCiLa81ayqrV5Lq' +
                    'U+NfZvzO8dfxqis6K5Lb+/lqRI6iajAKBggqhkjOPQQDAgNIADBFAiEAr8LYCY2b' +
                    'q5kNqOUxgHwBa2KTi/zJBR9L3IsTRDjJo8ECICf1xiDgKqZKrAMh0OCebskYwf53' +
                    'dooG04HBoqBLvB8Q' +
                    '-----END CERTIFICATE-----'
            },
            registrar: [
                {
                    enrollId: 'admin',
                    enrollSecret: 'adminpw'
                }
            ],
            caName: 'ca-org1'
        }
    },
    client:{
      organization: "Org1",
      connection:{
        timeout:{
          peer:{
            endorser: 120,
            eventHub: 60,
            eventReg: 3
          },
          orderer: 30
        }
      },
      credentialStore:{
        path: "/tmp/hfc-kvs/org1",
        cryptoStore:{
          path: "/tmp/hfc-cvs/org1"
        }
      }
    }
};

var client = Client.loadFromConfig(networkConfig);
client.setConfigSetting('initialize-with-discovery', true);

var channel = client.newChannel(channelName);
var peerUrl = "grpcs://localhost:7051";
//var data = fs.readFileSync(path.join(__dirname,'org1.example.com-cert.pem'));
//var pem = Buffer.from(data).toString();
var pem = '-----BEGIN CERTIFICATE-----' +
    'MIICSDCCAe6gAwIBAgIRAPnKpS42wlgtHsddm6q+kYcwCgYIKoZIzj0EAwIwcDEL' +
    'MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG' +
    'cmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xGTAXBgNVBAMTEG9y' +
    'ZzEuZXhhbXBsZS5jb20wHhcNMTcwNDIyMTIwMjU2WhcNMjcwNDIwMTIwMjU2WjBw' +
    'MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2Fu' +
    'IEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEZMBcGA1UEAxMQ' +
    'b3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABLi5341r' +
    'mriGFHCmVTLdgPGpDFRgwgmHSuLayMsGP0yEmsXh3hKAy24f1mjx/t8WT9G2sAdw' +
    'ONsPsfKMSCKpaRqjaTBnMA4GA1UdDwEB/wQEAwIBpjAZBgNVHSUEEjAQBgRVHSUA' +
    'BggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdDgQiBCCiLa81ayqrV5Lq' +
    'U+NfZvzO8dfxqis6K5Lb+/lqRI6iajAKBggqhkjOPQQDAgNIADBFAiEAr8LYCY2b' +
    'q5kNqOUxgHwBa2KTi/zJBR9L3IsTRDjJo8ECICf1xiDgKqZKrAMh0OCebskYwf53' +
    'dooG04HBoqBLvB8Q' +
    '-----END CERTIFICATE-----';
var options = {pem, 'ssl-target-name-override': 'peer0.org1.example.com', name: 'peer0.org1.example.com'};
var discoveryPeer = client.newPeer(peerUrl,options);
async function fectchResult( channel,peer ){
    var request = {
       'initialize-with-discovery': true,
       'target': peer,
    };
    await channel.initialize(request);
    return channel.getDiscoveryResults()
}

fectchResult(channel,discoveryPeer).then(result => {
    console.log(result);
});
