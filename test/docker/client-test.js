"use strict";

const Docker = require('dockerode');
const connectOptions = {
    protocol: 'http',
    host: "59.110.164.211",
    port: 7060
};

var docker = new Docker(connectOptions);

docker.info().then(function(info){
    console.log(info);
},function(err){
    console.error(err);
});
