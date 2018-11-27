'use strict';

const Action = require('./action');
const SshClient = require('../ssh/client');

module.exports = class KafkaProvisionAction extends Action {

    constructor() {
        super();
    }

    async execute() {
        let params = this.context.get(this.registry.CONTEXT.PARAMS);
        let sshClient = new SshClient({});
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
            sshClient.setOptions(zk);
            let containerName = zk.name + zk.zooMyId;
            let clusterString = zooServersString.replace(zk.host,containerName);
            let parameters = [
                'create',
                '--name', containerName,
                '--hostname', containerName,
                '--restart','always',
                '-e', 'ZOO_MY_ID=' + zk.zooMyId,
                '-e', clusterString,
                '-p', '2181:2181','-p', '2888:2888','-p', '3888:3888',
                'hyperledger/fabric-zookeeper'
            ];
            await sshClient.createContainer(parameters);
        }

        let brokerId = 0;
        let brokerList = [];
        for(let kafka of params.kafkas){
            sshClient.setOptions(kafka);
            let hostname = kafka.name;
            let parameters = [
                'create',
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
                'hyperledger/fabric-kafka'
            ];
            await sshClient.createContainer(parameters);
            brokerId = brokerId + 1;
            brokerList.push({
                host: kafka.host,
                port: 9092
            });
        }
        return brokerList;
    }

};