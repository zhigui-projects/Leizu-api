## Scenario: One-click to setup the network

1. Remove all existing docker containers
```shell
docker rm -f $(docker ps -qa)
```

2. Start api server and login
```shell
docker-compose -f docker-compose-dev.yml up -d
npm run doc && npm run dev
curl 'http://localhost:8080/api/v1/user/login' -H 'Content-Type: application/json' --data-binary @user-login.json
```
> Remember the `token`!

3. Prepare the network definition in json format
> network-definition.json

4. One-click to setup the network
```shell
curl -X POST 'http://localhost:8080/api/v1/request' -H 'Content-Type: application/json' -H 'Authorization: Bearer <token>' --data-binary @network-definition.json
```

5. [UI] Create a new organization(`Org3`)

6. [UI] Add a new peer into `Org3`

7. [UI] Let the new peer join an existing channel

8. [UI] Create a channel for `Org3`

