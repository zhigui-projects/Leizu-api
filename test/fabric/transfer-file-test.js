/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

const SshProvider = require('../../src/services/docker/ssh-provider');

var connectionOptions = {
    host: '39.106.149.201',
    username: 'root',
    password: 'password',
    port: 22
};

var transferDir = {
    localDir: '/tmp/new-org',
    remoteDir: '/tmp/new-org'
};

var transferFile = {
    local: '/tmp/new-org/new-org.zip',
    remote: '/tmp/new-org/new-org-tmp.zip'
};

var sshProvider = new SshProvider(connectionOptions);

sshProvider.transferDirectory(transferDir).then(result => {
    console.log('Upload directory succeed');

    return sshProvider.transferFile(transferFile);
}, err => {
    console.log('Upload directory failed: ', err);
}).then(result => {
    console.log('Upload file succeed');
}, err => {
    console.log('Upload file failed: ', err);
}).catch(err => {
    console.log('Upload catch err: ', err);
});


