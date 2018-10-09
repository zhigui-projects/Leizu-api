FROM node:8.12-alpine

LABEL maintainer="info@ziggurat.cn"

RUN apt-get update && apt-get -y install vim

ENV WORK_DIR /usr/src/app

COPY . ${WORK_DIR}
WORKDIR ${WORK_DIR}
RUN npm install

EXPOSE 8080

CMD ["npm", "start"]

