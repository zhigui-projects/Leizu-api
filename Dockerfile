# Copyright Zhigui.com. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

FROM node:8.12

LABEL maintainer="info@zhigui.com"

WORKDIR /usr/src/app

COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

COPY . .

RUN npm run doc

EXPOSE 8080

CMD ["npm", "start"]

