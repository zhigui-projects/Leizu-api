'use strict';

const mongoose = require('../../../src/libraries/db');
const ActionFactory = require("../../../src/services/action/factory");

(async function(){
    let params = {
        requestId: '5bc2a57c05ce040f0559a369'
    };
    let updateAction = ActionFactory.getConsortiumUpdateAction(params);
    await updateAction.execute();
    mongoose.disconnect();
})();

