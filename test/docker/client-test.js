"use strict";

const Docker = require('dockerode');
const env = {
    protocol: 'http',
    host: "59.110.164.211",
    port: 7060
};

var docker = new Docker(env);

docker.listImages({all: true}).then(containers => {
        console.log(containers);
      }).catch(err => {
        console.error(err);
    });
