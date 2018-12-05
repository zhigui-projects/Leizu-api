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

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
