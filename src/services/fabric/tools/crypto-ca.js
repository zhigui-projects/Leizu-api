/*
Copyright Zhigui.com. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const FabricCAServices = require('fabric-ca-client');
const User = require('fabric-ca-client/lib/User');
const { HFCAIdentityAttributes, HFCAIdentityType } = require('fabric-ca-client/lib/IdentityService');
const common = require('../../../libraries/common');
const stringUtil = require('../../../libraries/string-util');

module.exports = class CryptoCA {

    constructor(options) {
        this.options = options || {};
        this.init(this.options);
        this.bootstrapEnrollment = null;
        this.caService = null;
    }

    init(options){
        this.caName = options.caName;
        this.orgName = options.orgName;
        this.url = options.url;
        this.bootstrapUser = options.bootstrapUser || common.BOOTSTRAPUSER;
        this.adminUser = options.adminUser || common.ADMINUSER;
    }

    getFabricCaService(){
        if(this.caService){
            return this.caService;
        }
        let name = this.caName;
        let endpoint = this.url;
        let tlsOptions = {
            trustedRoots: [],
            verify: false
        };
        this.caService = new FabricCAServices(endpoint, tlsOptions, name);
        return this.caService;
    }

    async bootstrapUserEnrollement(){
    	let caService = this.getFabricCaService();
    	try{
    	    const enrollment = await caService.enroll(this.bootstrapUser);
            this.bootstrapEnrollment = new User(this.bootstrapUser.enrollmentID);
    	    await this.bootstrapEnrollment.setEnrollment(enrollment.key, enrollment.certificate, stringUtil.getMspId(this.orgName));
    	    return this.bootstrapEnrollment;
    	}catch(err){
    	    console.error(err);
    	    return null;
    	}
    }

    async addOrgAffiliation(){
        try {
            let caService = this.getFabricCaService();
            let affiliationService = caService.newAffiliationService();
            const newAffiliationRequest = {
    		    name: this.orgName
    	    };
            let response = await affiliationService.create(newAffiliationRequest, this.bootstrapEnrollment);
            return response;
        }catch(err){
            console.error(err);
            return null;
        }
    }

    async registerAdminUser(hfCAIdentityType){
        try {
            let caService = this.getFabricCaService();
            let attrs = [
                { name: HFCAIdentityAttributes.HFREGISTRARROLES, value: hfCAIdentityType },
                { name: HFCAIdentityAttributes.HFREGISTRARATTRIBUTES, value: '*'},
                { name: HFCAIdentityAttributes.HFREVOKER, value: 'true'},
                { name: HFCAIdentityAttributes.HFGENCRL, value: 'true'},
                { name: 'admin', value: 'true:ecert'},
                { name: 'abac.init', value: 'true:ecert'}
            ];
            let identity = {
        		enrollmentID: this.adminUser.enrollmentID,
        		enrollmentSecret: this.adminUser.enrollmentSecret,
        		affiliation: this.orgName,
                maxEnrollments: -1,
        		attrs: attrs
    	    };
            let response = await caService.register(identity, this.bootstrapEnrollment);
            return response;
        }catch(err){
            console.error(err);
        }
    }

    async registerUser(user){
        try {
            let caService = this.getFabricCaService();
            let attrs = [
                { name: HFCAIdentityAttributes.HFREGISTRARROLES, value: HFCAIdentityType.CLIENT }
            ];
            let identity = {
        		enrollmentID: user.enrollmentID,
        		enrollmentSecret: user.enrollmentSecret,
        		affiliation: user.orgName,
        		maxEnrollments: -1,
        		attrs: attrs
    	    };
            let response = await caService.register(identity, this.bootstrapEnrollment);
            return response;
        }catch(err){
            console.error(err);
        }
    }

    async enrollUser(user){
    	let caService = this.getFabricCaService();
    	try{
    	    let enrollment = await caService.enroll(user);
    	    return enrollment;
    	}catch(err){
    	    console.error(err);
    	    return null;
    	}
    }

    async postContainerStart(){
        let result = {};
        if(!this.bootstrapEnrollment){
            await this.bootstrapUserEnrollement();
        }
        await this.addOrgAffiliation();
        await this.registerAdminUser(HFCAIdentityType.CLIENT);
        result.enrollment = await this.enrollUser(this.adminUser);
        return result;
    }
};
