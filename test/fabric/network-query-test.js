const query = require("../src/services/fabric/network-query");

const peerConfig = {};
const caConfig = {};

query.getChannels(peerConfig,caConfig).then(response => {
	for (let i = 0; i < response.channels.length; i++) {
		console.log('channel id: ' + response.channels[i].channel_id);
	}
});