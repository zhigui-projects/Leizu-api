# Copyright Zhigui.com. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir /work
WORKDIR /work
COPY bin /work

EXPOSE 7059
CMD ./configtxlator start



