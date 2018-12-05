- rca环境变量

```
//工作目录
FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca
//是否开启TLS
FABRIC_CA_SERVER_TLS_ENABLED=true
//ca server的证书签名请求中的cn信息
FABRIC_CA_SERVER_CSR_CN=rca-org1
//ca server的证书签名请求中的主机信息
FABRIC_CA_SERVER_CSR_HOSTS=rca-org1
//debug模式是否开启
FABRIC_CA_SERVER_DEBUG=true
//非LDAP模式下的server的administrator账户密码
BOOTSTRAP_USER_PASS=rca-org1-admin:rca-org1-adminpw
//自签名证书目录
TARGET_CERTFILE=/data/org1-ca-cert.pem
//fabric的组织信息
FABRIC_ORGS=org0 org1 org2
```


- ica 环境变量
```
//工作目录
FABRIC_CA_SERVER_HOME=/etc/hyperledger/fabric-ca
//ca 名称
FABRIC_CA_SERVER_CA_NAME=ica-org0
//intermediate的tls证书，获取父ca的cert时用的
FABRIC_CA_SERVER_INTERMEDIATE_TLS_CERTFILES=/data/org0-ca-cert.pem
//uca的域名
FABRIC_CA_SERVER_CSR_HOSTS=ica-org0
//是否开启tls
FABRIC_CA_SERVER_TLS_ENABLED=true
//log级别
FABRIC_CA_SERVER_DEBUG=true
//ca的账户密码
BOOTSTRAP_USER_PASS=ica-org0-admin:ica-org0-adminpw
//父ca的授权信息
PARENT_URL=https://rca-org0-admin:rca-org0-adminpw@rca-org0:7054
//ica的自签名证书存放地址
TARGET_CHAINFILE=/data/org0-ca-chain.pem
ORG=org0
FABRIC_ORGS=org0 org1 org2
```

- orderer环境变量
```
//fabric-ca-client工作目录
- FABRIC_CA_CLIENT_HOME=/etc/hyperledger/orderer
//fabric-ca-client 身份证书
- FABRIC_CA_CLIENT_TLS_CERTFILES=/data/org0-ca-chain.pem
//请求ca url
- ENROLLMENT_URL=https://orderer1-org0:orderer1-org0pw@ica-org0:7054
//orderer工作目录
- ORDERER_HOME=/etc/hyperledger/orderer
//orderer访问host
- ORDERER_HOST=orderer1-org0
//服务绑定的监听地址
- ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
//系统通道初始区块的提供方式
- ORDERER_GENERAL_GENESISMETHOD=file
//使用现成初始区块文件时，指定区块文件所在路径
- ORDERER_GENERAL_GENESISFILE=/data/genesis.block
//orderer关联的MSP的ID，需要与联盟配置中的组织的MSP名称一致
- ORDERER_GENERAL_LOCALMSPID=org0MSP
//MSP目录所在的路径
- ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/orderer/msp
//是否开启tls
- ORDERER_GENERAL_TLS_ENABLED=true
//orderer签名私钥
- ORDERER_GENERAL_TLS_PRIVATEKEY=/etc/hyperledger/orderer/tls/server.key
//orderer身份证书
- ORDERER_GENERAL_TLS_CERTIFICATE=/etc/hyperledger/orderer/tls/server.crt
//信任的根证书
- ORDERER_GENERAL_TLS_ROOTCAS=[/data/org0-ca-chain.pem]
//是否对客户端也进行认证
- ORDERER_GENERAL_TLS_CLIENTAUTHREQUIRED=true
//客户端的根证书
- ORDERER_GENERAL_TLS_CLIENTROOTCAS=[/data/org0-ca-chain.pem]
//log级别
- ORDERER_GENERAL_LOGLEVEL=debug
- ORDERER_DEBUG_BROADCASTTRACEDIR=data/logs
- ORG=org0
//组织管理员的身份证书
- ORG_ADMIN_CERT=/data/orgs/org0/msp/admincerts/cert.pem
```



- peer环境变量
```
//fabric-ca-client工作目录
- FABRIC_CA_CLIENT_HOME=/opt/gopath/src/github.com/hyperledger/fabric/peer
//peer中的ca—client的身份证书
- FABRIC_CA_CLIENT_TLS_CERTFILES=/data/org1-ca-chain.pem
//enroll请求的ca地址(包含当前peer的用户名及密码)
- ENROLLMENT_URL=https://peer1-org1:peer1-org1pw@ica-org1:7054
//peer名称
- PEER_NAME=peer1-org1
//peer工作目录
- PEER_HOME=/opt/gopath/src/github.com/hyperledger/fabric/peer
//peer的host
- PEER_HOST=peer1-org1
//peer的ca账户的用户名密码
- PEER_NAME_PASS=peer1-org1:peer1-org1pw
//peer的id
- CORE_PEER_ID=peer1-org1
//peer的地址
- CORE_PEER_ADDRESS=peer1-org1:7051
//peer的mspid
- CORE_PEER_LOCALMSPID=org1MSP
//peer的msp配置
- CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/msp
//docker deamon地址
- CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
//vm访问的网络
- CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=net_fabric-ca
//log级别
- CORE_LOGGING_LEVEL=DEBUG
//是否启用tls
- CORE_PEER_TLS_ENABLED=true
//本服务的身份验证证书，公开可见，访问者通过该证书进行验证
- CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/tls/server.crt
//本服务的签名私钥
- CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/tls/server.key
//peer的根证书
- CORE_PEER_TLS_ROOTCERT_FILE=/data/org1-ca-chain.pem
//是否对客户端也进行认证
- CORE_PEER_TLS_CLIENTAUTHREQUIRED=true
//peer节点的客户端的根证书
- CORE_PEER_TLS_CLIENTROOTCAS_FILES=/data/org1-ca-chain.pem
//tls客户端的x.509证书，构建客户端连接使用
- CORE_PEER_TLS_CLIENTCERT_FILE=/data/tls/peer1-org1-client.crt
//tls客户端私钥，构建客户端连接使用
- CORE_PEER_TLS_CLIENTKEY_FILE=/data/tls/peer1-org1-client.key
//是否允许节点之间动态进行代表节点的选举
- CORE_PEER_GOSSIP_USELEADERELECTION=true
//本节点是否指定为组织的代表节点，与useLeaderElection不能同时为true
- CORE_PEER_GOSSIP_ORGLEADER=false
//节点被组织外节点感知时的地址
- CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1-org1:7051
- CORE_PEER_GOSSIP_SKIPHANDSHAKE=true
- ORG=org1
//组织的admin证书
- ORG_ADMIN_CERT=/data/orgs/org1/msp/admincerts/cert.pem
```

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
