#!/usr/bin/env bash

TAG=latest

docker pull hyperledger/fabric-ca:${TAG}
docker pull hyperledger/fabric-ca-peer:${TAG}
docker pull hyperledger/fabric-ca-orderer:${TAG}
docker pull hyperledger/fabric-kafka:${TAG}
docker pull hyperledger/fabric-zookeeper:${TAG}