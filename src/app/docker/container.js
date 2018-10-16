const Docker = require('dockerode');
const config = require('../../env');
const DEFAULT_PORT = config.docker.port;

const router = require('koa-router')({prefix: '/docker'});
router.get('/info', async (ctx) => {
    const docker = new Docker({host: ctx.query['host'], port: DEFAULT_PORT});

    await docker.info().then((info) => {
        ctx.body = info;
    }).catch(err => {
        ctx.body = err;
    });
});

router.get('/containers/json', async (ctx) => {
    const docker = new Docker({host: ctx.query['host'], port: DEFAULT_PORT});

    await docker.listContainers({all: true}).then(containers => {
        ctx.body = containers;
    }).catch(err => {
        ctx.body = err;
    });
});

router.post('/containers/create', async (ctx) => {
    const docker = new Docker({host: ctx.query['host'], port: DEFAULT_PORT});
    let payload = ctx.request.body;
    let portBindings = {};
    payload['ports'].forEach((portEntry) => {
        let ports = portEntry.split(':');
        portBindings[`${ports[1]}/tcp`] = [{HostPort: ports[0]}];
    });
    let options = {
        _query: {name: payload['container_name']},
        Env: payload['environment'],
        Image: payload['image'],
        HostConfig: {
            PortBindings: portBindings
        }
    };

    console.log('creating container: ', options);
    await docker.createContainer(options).then(container => {
        ctx.body = container;
    }).catch(err => {
        ctx.body = err;
    });
});

router.post('/containers/:id/start', async (ctx) => {
    const docker = new Docker({host: ctx.query['host'], port: DEFAULT_PORT});
    const container = docker.getContainer(ctx.params.id);

    await container.start().then((data) => {
        console.log('Start container successfully: ', data);
        ctx.body = data;
    }).catch(err => {
        console.log('Start container failed: ', err);
        ctx.body = err;
    });
});

module.exports = router;