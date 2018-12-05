# Copyright Zhigui.com. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

FROM node:8.12

LABEL maintainer="info@ziggurat.cn"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm install --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

