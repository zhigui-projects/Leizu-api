/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

module.exports = {
    RESOURCE: {
        PEER: 'peer',
        ORDERER: 'orderer',
        CONSORTIUM: 'consortium',
        REQUEST: 'request',
        CA: 'ca',
        KAFKA: 'kafka',
        CHANNEL: 'channel',
        CADVISOR: 'cadvisor',
    },
    TYPE: {
        PROVISION: 'provision',
        CREATE: 'create',
        JOIN: 'join',
        UPDATE: 'update',
        ROLLBACK: 'rollback'
    },
    CONTEXT: {
        PARAMS: 'params',
        CONSORTIUM_ID: 'consortiumId',
        REQUEST_ID: 'requestId',
        ORGANIZATION_ID: 'organizationId'
    }
};