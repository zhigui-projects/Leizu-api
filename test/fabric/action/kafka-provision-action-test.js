'use strict';

const ActionFactory = require("../../../src/services/action/factory");

(async function(){
    let params = {
        "consensus": "kafka",
        "kafkas": [
            {
                "name": "kafka1",
                "host": "39.104.189.169",
                "username": "root",
                "password": "***REMOVED***"
            },
            {
                "name": "kafka2",
                "host": "39.104.152.81",
                "username": "root",
                "password": "***REMOVED***"
            },
            {
                "name": "kafka3",
                "host": "39.104.51.94",
                "username": "root",
                "password": "***REMOVED***"
            },
            {
                "name": "kafka4",
                "host": "39.104.145.229",
                "username": "root",
                "password": "***REMOVED***"
            }            
        ],
        "zookeepers": [
            {
                "name": "zookeeper1",
                "host": "39.104.189.169",
                "username": "root",
                "password": "***REMOVED***"
            },
            {
                "name": "zookeeper2",
                "host": "39.104.152.81",
                "username": "root",
                "password": "***REMOVED***"
            },
            {
                "name": "zookeeper3",
                "host": "39.104.51.94",
                "username": "root",
                "password": "***REMOVED***"
            }            
        ],
    };
    let action = ActionFactory.getKafkaProvisionAction(params);
    await action.execute();
    console.log('finish the action');
})();