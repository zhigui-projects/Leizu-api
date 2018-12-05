/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const mongoose = require('../../../src/libraries/db');
const ActionFactory = require('../../../src/services/action/factory');

(async function(){
    let params = {
        requestId: '5c00d127e602e622166d3481'
    };
    let updateAction = ActionFactory.getConsortiumUpdateAction(params);
    await updateAction.execute();
    mongoose.disconnect();
})();

