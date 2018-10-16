"use strict";

const Docker = require('dockerode');
const connectOptions = require("./options");

var docker = new Docker(connectOptions);

docker.info().then(function(info){
    console.log(info);
},function(err){
    console.error(err);
});


async function getDockerVersion(docker){
    try{
        let version = await docker.version();
        console.log(version);
    }catch(err){
        console.error("<<<< capture the errors >>>>")
        console.error(err);
    }
    
}

getDockerVersion(docker);