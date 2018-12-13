/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const Action = require('./action');
const Client = require('../transport/client');

module.exports = class KafkaProvisionAction extends Action {
    constructor() {
        super();
    }

    async execute() {
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let client = Client.getInstance({});
        let zookeepers = params.zookeepers;
        let zooServers = [];
        let kafkaZooKeeperConnect = [];
        for(let index = 1; index < zookeepers.length +1; index++){
            let zk = zookeepers[index-1];
            let server = 'server.' + index + '=' + zk.host +':2888:3888';
            zooServers.push(server);
            kafkaZooKeeperConnect.push(zk.host + ':2181');
            zk.zooMyId = index;
        }
        let zooServersString = 'ZOO_SERVERS=' + zooServers.join(' ');
        for(let zk of zookeepers){
            client.setOptions(zk);
            let hostName = zk.name;
            let clusterString = zooServersString.replace(zk.host,hostName);
            let parameters = [
                'create',
                '--name', zk.name,
                '--hostname', hostName,
                '--restart','always',
                '-e', 'ZOO_MY_ID=' + zk.zooMyId,
                '-e', clusterString,
                '-p', '2181:2181','-p', '2888:2888','-p', '3888:3888',
                'hyperledger/fabric-zookeeper'
            ];
            await client.createContainer(parameters);
        }

        let brokerId = 0;
        let brokerList = [];
        let hostnames = [];
        hostnames.push('create');
        for(let kafka of params.kafkas){
            hostnames.push('--add-host');
            hostnames.push(kafka.name + ':' + kafka.host );
        }
        for(let kafka of params.kafkas){
            client.setOptions(kafka);
            let hostname = kafka.name;
            let parameters = [
                '--name', kafka.name,
                '--hostname',hostname,
                '--restart','always',
                '-e', 'KAFKA_MESSAGE_MAX_BYTES=103809024',
                '-e', 'KAFKA_REPLICA_FETCH_MAX_BYTES=103809024',
                '-e', 'KAFKA_UNCLEAN_LEADER_ELECTION_ENABLE=false',
                '-e', 'KAFKA_BROKER_ID=' + brokerId,
                '-e', 'KAFKA_MIN_INSYNC_REPLICAS=2',
                '-e', 'KAFKA_DEFAULT_REPLICATION_FACTOR=3',
                '-e', 'KAFKA_ZOOKEEPER_CONNECT=' + kafkaZooKeeperConnect.join(','),
                '-e', 'KAFKA_HOST_NAME='+hostname,
                '-e', 'KAFKA_LISTENERS=EXTERNAL://0.0.0.0:9092,REPLICATION://0.0.0.0:9093',
                '-e', 'KAFKA_ADVERTISED_LISTENERS=EXTERNAL://' + kafka.host + ':9092,REPLICATION://' + hostname + ':9093',
                '-e', 'KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=EXTERNAL:PLAINTEXT,REPLICATION:PLAINTEXT',
                '-e', 'KAFKA_INTER_BROKER_LISTENER_NAME=REPLICATION',
                '-p', '9092:9092',
                '-p', '9093:9093',
                'hyperledger/fabric-kafka'
            ];
            parameters = hostnames.concat(parameters);
            await client.createContainer(parameters);
            brokerId = brokerId + 1;
            brokerList.push({
                host: kafka.host,
                port: 9092
            });
        }
        return brokerList;
    }
};
