# How to add new organization into existing fabric network?

## Procedures

The general flow will be to:

1. set up a configtxlator server to interact with the config block of the channel
2. fetch the config block using peer channel fetch command
3. translate the retrieved config block from protobuf to json using configtxlator server
4. modify the json configuration to include the new org's info
5. encode the json into protobuf using configtxlator
6. compute the delta of the new config and the original in the channel
7. decode the delta config update from protobuf to json
8. wrap that json update in an envelope
9. encode the resulting json into protobuf again, using configtxlator
10. sign the transaction for a sufficient subset of the channel's membership to satisfy its endorsement policy
11. submit the signed channel update command with peer channel update command
12. fetch the genesis block for the channel with peer channel fetch
13. start the new org's peer(s)
14. join the new org's peer(s) to the channel using the genesis block with peer channel join
15. install the chaincode to the new org's peer(s) as needed
16. upgrade the chaincode to set a new endorsement policy including the new organization

## References

- [add-org](https://github.com/PacktPublishing/Handson-Blockchain-Development-with-Hyperledger/tree/master/network/add_org)
- [hyperledger-fabric-add-orgs](https://github.com/alejandrolr/hyperledger-fabric-add-orgs)
- [add-an-organization-fabric](https://developer.ibm.com/tutorials/cl-add-an-organization-to-your-hyperledger-fabric-blockchain/)
- [Adding an Org to a Channel](https://hyperledger-fabric.readthedocs.io/en/release-1.2/channel_update_tutorial.html)

## License

Dashboard API Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Dashboard API Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
