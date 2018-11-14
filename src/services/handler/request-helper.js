'use strict';

module.exports = class RequestHelper {

    static decomposeRequest(ctx,request){
        let result = {};
        result.OrgOrderer = {};
        result.OrgPeer = [];
        result.orgs = {};
        result.peers = {};
        return result;
    }

    static generateHostName(){

    }

};