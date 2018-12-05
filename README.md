# Dashboard

[![pipeline status](http://gitlab.ziggurat.cn/zhigui/dashboard-api/badges/master/pipeline.svg)](http://gitlab.ziggurat.cn/zhigui/dashboard-api/commits/master)

Ledger Management Dashboard

## Pre-requisitions

* Node 8.9 <= version < 9.0
* NPM
* Docker
* Docker-compose
* Mongo

## How to run

* Start mongo

```
mongod --dbpath ~/mongo &
```

* Install dependencies

```
npm install
```

* Start dashboard api server

Dev mode:

```
npm run dev
```

Prod mode:

```
npm start
```

* Sanity check

check api connectivity:

```
curl localhost:8080/api/v1
```

`welcome to ledger dashboard!` should be returned.

```
curl localhost:8080/api/v1/demo
```

An error message asks for token should be returned as below:

```
{
    "errors": [
        {
            "message": "Missing Auth Token"
        }
    ]
}
```

* Check api docs

> Run `npm run doc` before start the server.

Swagger UI version visit [localhost:8080](localhost:8080).

JSON version see `curl localhost:8080/api-docs`.

* Start in docker way

Just one click `docker-compose -f docker-compose-dev.yml up --build -d`.

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
