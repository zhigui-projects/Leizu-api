# Copyright Zhigui.com. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env bash
cd ..
docker-compose -f docker-compose-dev.yml down
docker rmi zhigui/configtxlator:latest
npm install
npm run doc
#docker build --rm -t dashboard-api:latest .
docker-compose -f docker-compose-dev.yml up -d
