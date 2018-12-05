# Dashboard API

Ledger Management Dashboard

## Pre-requisitions

* Node 8.9 <= version < 9.0
* NPM
* Docker
* Docker-compose
* Mongo

> **Before start the api server**
>
> Add an environment file called `.env` to the root folder of the project, with the required project settings and credentials. For a starter environment file, you can use this one:
> ```
> cp .env.sample .env
> ```

## Run it manually

1. Start mongo

```
mongod --dbpath ~/mongo &
```

2. Install dependencies

```
npm install
```

3. Generate api docs

```
npm run doc
```

4. Start dashboard api server

Dev mode:

```
npm run dev
```

Prod mode:

```
npm start
```

5. Check api docs

Swagger UI version visit [localhost:8080](http://localhost:8080).

JSON version visit [localhost:8080/api-docs](http://localhost:8080/api-docs).

## Run it in docker way

Just one click:
```
docker-compose -f docker-compose-dev.yml up --build -d
```

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
