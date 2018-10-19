# Dockerfile for Hyperledger fabric configtxlator

FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir /work
WORKDIR /work
COPY bin /work

EXPOSE 7059
CMD ./configtxlator start



