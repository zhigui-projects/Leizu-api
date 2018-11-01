'use strict';

const FabricCAServices = require('fabric-ca-client');
const User = require('fabric-ca-client/lib/User');
const { HFCAIdentityAttributes, HFCAIdentityType } = require('fabric-ca-client/lib/IdentityService');
const common = require('../../libraries/common');

module.exports = class CryptoCA {
    
    constructor(bootstrapUser, options) {
        this.bootstrapUser = bootstrapUser || common.BOOTSTRAPUSER;
        this.options = options || {};
        this.orgName = this.options.orgName;
        this.adminUser = this.options.adminUser || common.ADMINUSER;
        this.bootstrapEnrollment = null;
        this.caService = null;
    }
    
    getFabricCaService(){
        if(this.caService){
            return this.caService;
        } 
        let name = this.options.name
        let endpoint = this.options.url;
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
    	    let bootstrapAdmin = new User(this.bootstrapUser.enrollmentID);
    	    this.bootstrapEnrollment = await bootstrapAdmin.setEnrollment(enrollment.key, enrollment.certificate, 'Org1MSP');
    	    return bootstrapAdmin;
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
    		    name: this.orgName,
    	    }
            let response = await affiliationService.create(newAffiliationRequest, this.bootstrapEnrollment);
            return response;
        }catch(err){
            console.error(err);
            return null;
        }    
    }    

    async registerAdminUser(){
        try {
            let caService = this.getFabricCaService();
            let attrs = [
                { name: HFCAIdentityAttributes.HFREGISTRARROLES, value: HFCAIdentityType.CLIENT },
                { name: HFCAIdentityAttributes.HFREGISTRARATTRIBUTES, value: '*'},
                { name: HFCAIdentityAttributes.HFREVOKER, value: 'true'},
                { name: HFCAIdentityAttributes.HFGENCRL, value: 'true'},
                { name: 'admin', value: 'true:ecert'},
                { name: 'abac.init', value: 'true:ecert'}
            ];
            let identity = {
        		enrollmentID: this.adminUser.enrollmentID + this.orgName,
        		enrollmentSecret: this.adminUser.enrollmentSecret,
        		affiliation: this.orgName,
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
    	    const enrollment = await caService.enroll(user);
    	    return enrollment;
    	}catch(err){
    	    console.error(err);
    	    return null;
    	}
    }
    
    async postContainerStart(params){
        
    }
}
