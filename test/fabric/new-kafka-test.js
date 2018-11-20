'use strict';

const ActionFactory = require("../../src/services/action/factory");

(async function(){
    let params = {
        "consensus": "kafka",
        "kafka": [{
            "name": "kafka1",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        }],
        "zookeeper": [{
            "name": "zookeeper1",
            "ip": "47.254.88.92",
            "ssh_username": "root",
            "ssh_password": "Jia@163.com"
        }],
    };
    let action = ActionFactory.getKafkaProvisionAction(params);
    await action.execute();
})();