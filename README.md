# Dashboard API

Ledger Management Dashboard

## Pre-requisitions

* Node 8.9 <= version < 9.0
* NPM v6.4+
* Docker v18.06+
* Docker-compose v1.18+
* Mongo v4.0+

## Quick Start

> **Before start the api server**
>
> Add an environment file called `.env` to the root folder of the project, with the required project settings and credentials. For a starter environment file, you can use this one:
> ```
> cp .env.dev .env
> ```

1. Start all the services:

```
docker-compose -f docker-compose-dev.yml up --build -d
```

2. initialize the default user: admin/passw0rd

```
docker exec -it dashboard-mongodb mongo

use zigdb;

db.user.insert({username:'admin',password:'5c604fdbe7060760ab75d54c042d71f0e49e621a'});
```

3. Check api docs

Swagger UI version visit [localhost:8080](http://localhost:8080).

JSON version visit [localhost:8080/api-docs](http://localhost:8080/api-docs).

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
