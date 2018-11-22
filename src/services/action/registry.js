'use strict';

module.exports = {
    RESOURCE: {
        PEER: 'peer',
        ORDERER: 'orderer',
        CONSORTIUM: 'consortium',
        REQUEST: 'request',
        CA: 'ca',
        KAFKA: 'kafka',
        CHANNEL: 'channel'
    },
    TYPE: {
        PROVISION: 'provision',
        CREATE: 'create',
        JOIN: 'join',
        ROLLBACK: 'rollback'
    },
    CONTEXT: {
        PARAMS: 'params',
        CONSORTIUM_ID: 'consortiumId',
        REQUEST_ID: 'requestId',
        ORGANIZATION_ID: 'organizationId'
    }
};