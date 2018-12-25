## Scenario: Sync the existing network

1. Remove all existing docker containers
```shell
docker rm -f $(docker ps -qa)
```

2. Setup an initial fabric network with docker compose
```shell
cd fabric-sdk-node
gulp docker-ready

# To verify the network
node test/integration/e2e.js
```

3. Start api server and login
```shell
docker-compose -f docker-compose-dev.yml up -d
npm run doc && npm run dev
curl 'http://localhost:8080/api/v1/user/login' -H 'Content-Type: application/json' --data-binary @user-login.json
```
> Remember the `token`!

4. Prepare the keys and certificates for the fabric service discovery
> consortium-definition.json

5. Create a consortium
```shell
curl 'http://localhost:8080/api/v1/consortium' -H 'Content-Type: application/json' -H 'Authorization: Bearer <token>' --data-binary @create-consortium.json
```
> Remember the `consortium id`!

6. Sync the existing network
```shell
curl 'http://localhost:8080/api/v1/fabric/sync/<consortiumId>' -H 'Content-Type: application/json' -H 'Authorization: Bearer <token>'
```

7. Show the network info in the dashboard UI
