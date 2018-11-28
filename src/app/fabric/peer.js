'use strict';

const PeerService = require('../../services/fabric/peer');
const common = require('../../libraries/common');
const logger = require('../../libraries/log4js');
const router = require('koa-router')({prefix: '/peer'});
const SSHClient = require('../../services/ssh/client');
const config = require('../../env');

router.get('/', async ctx => {
    try {
        const peerDetails = await PeerService.list(ctx.query['organizationId']);
        ctx.body = common.success(peerDetails, common.SUCCESS);
    } catch (ex) {
        logger.error(ex);
        ctx.status = 400;
        ctx.body = common.error(null, ex.message);
    }
});

router.get('/:id', async ctx => {
    try {
        const peer = PeerService.findById(ctx.params.id);
        ctx.body = common.success(peer, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/', async ctx => {
    try {
        let {organizationId, peers} = ctx.request.body;
        //TODO: check whether image is provided or supported

        var eventPromises = [];
        for (let item of peers) {
            let txPromise = new Promise((resolve, reject) => {
                try {
                    item.organizationId = organizationId;
                    resolve(PeerService.create(item));
                } catch (e) {
                    reject(e.message);
                }
            });
            eventPromises.push(txPromise);
        }
        await Promise.all(eventPromises).then(result => {
            ctx.body = common.success(result, common.SUCCESS);
        }, err => {
            throw err;
        });
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.put('/:id', async ctx => {
    const id = ctx.params.id;
    try {
        await PeerService.joinChannel(id, ctx.request.body);
        ctx.body = common.success({id: id}, common.SUCCESS);
    } catch (err) {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, err.message);
    }
});

router.post('/check', async ctx => {
    const {host, username, password, port} = ctx.request.body;
    if (host && username && password) {
        try {
            let connectionOptions = {
                cmd: 'date',
                host: host,
                username: username,
                password: password,
                port: port || config.ssh.port
            };
            const sshClient = new SSHClient(connectionOptions);
            await sshClient.exec();
            ctx.body = common.success('Successful connection detection.', common.SUCCESS);
        } catch (err) {
            logger.error(err);
            ctx.status = 400;
            ctx.body = common.error({}, err.message);
        }
    } else {
        logger.error(err);
        ctx.status = 400;
        ctx.body = common.error({}, 'Missing peer ip, ssh user name or password.');
    }
});

module.exports = router;
