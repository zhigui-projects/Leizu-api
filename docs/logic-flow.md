# 基本核心流程和步骤

## 动态创建一个组织的步骤

- deploy root ca
- deploy intermediate ca
- register and enroll the intermediate ca with root ca

## 在通道配置中增加一个组织的流程

- fetch the configuration block
- add the new organization into protocol buffer object
- sign the protocol buffer object
- submit the channel update request

## 将组织下的节点加入到通道的步骤

- fetch the channel genesis block
- submit the join channel request

## 动态增加一个节点的过程

- register and enroll tls
- register and enroll msp
- execute the peer node start command

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
