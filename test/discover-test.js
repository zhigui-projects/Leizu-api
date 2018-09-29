const Client = require('fabric-client');
const fs = require("fs");
const path = require("path");

const channelName = "mychannel";
var networkConfig = {
    version: "1.0"
};

var client = Client.loadFromConfig(networkConfig);
client.setConfigSetting('initialize-with-discovery', true);

var channel = client.newChannel(channelName);
var peerUrl = "grpcs://localhost:7051";
var data = fs.readFileSync(path.join(__dirname,'org1.example.com-cert.pem'));
var pem = Buffer.from(data).toString();
var options = {pem, 'ssl-target-name-override': 'peer0.org1.example.com', name: 'peer0.org1.example.com'};
var discoveryPeer = client.newPeer(peerUrl,options);
var fectchResult = async function( client,channel,peer ){
    var request = {
       'initialize-with-discovery': true,
       'target': peer,
    };
    await channel.initialize(request);
    return channel.getDiscoveryResults()
}

fectchResult(client,channel,discoveryPeer).then(result => {
    console.log(result);
});
