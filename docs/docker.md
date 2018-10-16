# Docker Guide

## Enable http access

1. get the docker service unit file

```
systemctl status docker
```

2. update the service unit file

```
DOCKER_OPTS="-H unix:///var/run/docker.sock -H tcp://0.0.0.0:2375"
```

3. restart the docker service

```
systemctl daemon-reload
systemctl restart docker
```

