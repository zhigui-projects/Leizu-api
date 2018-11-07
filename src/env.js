module.exports = {
    koaLogger: true,
    jwt: {
        secret: '`yGE[RniLYCX6rCni>DKG_(3#si&zvA$WPmgrb2P',
        expiresIn: 36000
    },
    database: {
        url: 'mongodb://127.0.0.1:27017/zigdb',
        debug: false
    },
    docker: {
        enabled: false,
        port: 2375
    },
    prometheus: {
        url: 'http://47.94.200.47:9090'
    },
    configtxlator: {
        url: 'http://59.110.164.211:7059'
    },
    configTx: {
        path: '../../../build/configtxlator/configtx.yaml'
    },
    neworg: {
        path: '../../../build/configtxlator/newOrg/configtx.yaml'
    }
};