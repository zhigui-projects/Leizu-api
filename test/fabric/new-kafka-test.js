'use strict';

const ActionFactory = require("../../src/services/action/factory");

(async function(){
    let params = {
        "consensus": "kafka",
        "kafkas": [{
            "name": "kafka1",
            "host": "39.105.67.252",
            "username": "root",
            "password": "***REMOVED***"
        }],
        "zookeepers": [{
            "name": "zookeeper1",
            "host": "39.105.67.252",
            "username": "root",
            "password": "***REMOVED***"
        }],
    };
    let action = ActionFactory.getKafkaProvisionAction(params);
    await action.execute();
})();