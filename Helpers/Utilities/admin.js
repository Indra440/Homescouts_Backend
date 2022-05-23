const userModel = require('../../models/mongoose/users')
const extensionModel = require('../../models/mongoose/extensions')
const extensionuserModel = require('../../models/mongoose/extensionusers')
const _helper = require('../../Helpers/helpers')


module.exports.createAdmin = async (body) =>{
    const { email, first_name, last_name, balance } = body;
    let errResponse = {
        "status":false,
        message :"Error while creating Admin",
        payload:{}
    }
    let successResponse ={
        "status":true,
        message :"Admin created successfully",
        payload:{}
    }
    try{
        const hash = await _helper.utility.common.encryptPassword(10, '123456')
        if(balance < 0 || balance == "-0"){
            errResponse.message = "Enter a valid balance";
            return errResponse;
        }
        let payload = {
            name: {
                first_name: first_name ? first_name : "",
                last_name: last_name ? last_name : ""
            },
            email: email.toLowerCase(),
            password: hash,
            user_type : 2,
            balance
        }
        let checkIfEmailExists = await userModel.findOne({email : payload.email, is_deleted : false})
        if(!checkIfEmailExists) {
        let userData = await userModel.create(payload)
                if(!userData){
                    errResponse.payload = err;
                    return errResponse;
                }
                if (userData) {
                    successResponse.payload = userData;
                    return successResponse;
                }
        }else{
            errResponse.message = "Email already exist";
            return errResponse;
        }
    }catch(err){
        errResponse.payload = err;
        return errResponse;
    }
}

module.exports.manageAdminProcess = async (admin_id,adminDetails,scenario) =>{
    let errResponse = {
        "status":false,
        payload:{}
    }
    let successResponse ={
        "status":true,
        payload:{}
    }
    try{
        let queryValue,setValue,extension_status
        (scenario == "suspend") ? (queryValue = 0,setValue = 1,extension_status = false) : "";
        (scenario == "unsuspend") ? (queryValue = 1,setValue = 0,extension_status = true) : "";
        (scenario == "delete") ? (queryValue = false,setValue = true,extension_status = false) : "";
        let scenarioString = (scenario == "delete") ? "is_deleted" : "suspended_by";
        adminDetails[scenarioString] = setValue;
        let ceoQuery = {
            associated_admin_id : admin_id,
            user_type : 3,
            is_deleted : false
        }
        scenario != "delete" ? (ceoQuery.suspended_by = queryValue) : "";
        let associateCeoDetails = await userModel.find(ceoQuery)
        if(!associateCeoDetails){
            return errResponse;
        }
        if(associateCeoDetails.length > 0){
            let update = {$set:{}};
            update.$set[scenarioString] = setValue;
            associateCeoDetails.map( async (cur_ceo) =>{
                let curCeoId = cur_ceo._id;
                if(cur_ceo[scenarioString] == queryValue){
                    userModel.updateOne(
                        {_id:curCeoId},
                        update,
                        (err,result)=>{
                            if(err){
                                return errResponse;
                            }
                        })
                    cur_ceo[scenarioString]  = setValue;
                }
            })
        }
         
        let associateExtensionDetails = await extensionModel.find({admin_id :admin_id,is_active : !extension_status })
        if(!associateExtensionDetails){
            return errResponse;
        }
        if(associateExtensionDetails.length > 0){
            associateExtensionDetails.map((cur_extension) =>{
                extensionModel.updateOne(
                    {_id : cur_extension._id},
                    {$set:{"is_active" : extension_status }},
                    (err,result)=>{
                        if(err){
                            return errResponse;
                        }
                    })
            })
        }
        let associateExtensionUsers = await extensionuserModel.find()
                        .elemMatch("associated_extension_details",{admin_id:admin_id});
            if(!associateExtensionUsers){
                return errResponse
            }
        if(associateExtensionUsers.length > 0){
            let update = {$set:{}};
            if(scenario == "delete"){
                update.$set["associated_extension_details.$.is_deleted"] = setValue;
            }else{
                update.$set["associated_extension_details.$.suspended_by"] = setValue;
            }
            associateExtensionUsers.map( async (cur_user)=>{
                let cur_users_extension = cur_user.associated_extension_details;
                cur_users_extension.map( async (cur_extn) =>{
                    if((cur_extn.admin_id.equals(admin_id)) && (cur_extn[scenarioString] === queryValue)){
                        console.log("Its comming here");
                        extensionuserModel.updateOne(
                            {_id:cur_user._id,"associated_extension_details.admin_id":admin_id},
                            update,
                            (err,result)=>{
                                if(err){
                                    return errResponse;
                                }
                            })
                        cur_extn[scenarioString] = setValue;
                    }
                })
            })
        }
        adminDetails.save();
        successResponse.payload = {
            adminDetails,
            associateCeoDetails
        }
        return successResponse
    }catch(err){
        errResponse.payload = err;
        return errResponse;
    }
}

