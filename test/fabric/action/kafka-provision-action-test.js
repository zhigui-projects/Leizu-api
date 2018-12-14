/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const ActionFactory = require('../../../src/services/action/factory');

(async function () {
    let params = {
        'consensus': 'kafka',
        'kafkas': [
            {
                'name': 'kafka1',
                'host': '39.104.189.169',
                'username': 'root',
                'password': ''
            },
            {
                'name': 'kafka2',
                'host': '39.104.152.81',
                'username': 'root',
                'password': ''
            },
            {
                'name': 'kafka3',
                'host': '39.104.51.94',
                'username': 'root',
                'password': ''
            },
            {
                'name': 'kafka4',
                'host': '39.104.145.229',
                'username': 'root',
                'password': ''
            }
        ],
        'zookeepers': [
            {
                'name': 'zookeeper1',
                'host': '39.104.189.169',
                'username': 'root',
                'password': ''
            },
            {
                'name': 'zookeeper2',
                'host': '39.104.152.81',
                'username': 'root',
                'password': ''
            },
            {
                'name': 'zookeeper3',
                'host': '39.104.51.94',
                'username': 'root',
                'password': ''
            }
        ],
    };
    let action = ActionFactory.getKafkaProvisionAction(params);
    await action.execute();
    console.log('finish the action');
})();
