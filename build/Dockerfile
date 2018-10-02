FROM node:8.10

MAINTAINER dashboard "info@ziggurat.cn"

RUN apt-get update && apt-get -y install vim

ENV WORK_DIR /usr/src/app
RUN mkdir -p ${WORK_DIR}
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install && npm cache clean
COPY ../ /usr/src/app

EXPOSE 8080

CMD ["npm", "start"]

