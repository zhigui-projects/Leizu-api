#!/usr/bin/env bash
cd ..
docker rmi dashboard-api:latest
npm install
npm run doc
#docker build --rm -t dashboard-api:latest .
docker-compose -f docker-compose-dev.yml up -d
