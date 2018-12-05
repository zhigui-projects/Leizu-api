# Copyright Zhigui.com. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

FROM node:8.12

LABEL maintainer="info@ziggurat.cn"

WORKDIR /usr/src/app

COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

RUN npm run doc

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

