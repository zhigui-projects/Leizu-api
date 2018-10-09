'use strict';

const mongoose = require("../../src/libraries/db");
const logger = require("../../src/libraries/log4js");
const Consortium = require("../../src/models/consortium");
const FabricService = require("../../src/services/db/fabric");

async function testFabricService(){
    let consortium = await Consortium.findOne();
    //logger.debug(consortium);
    let consortiumId = consortium._id;
    let fabricService = new FabricService(consortiumId);
    let channel = await fabricService.addChannel({name:'mychannel'});
    logger.debug(channel);
}

testFabricService().then(function(){
    mongoose.disconnect();
})