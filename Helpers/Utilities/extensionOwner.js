const extensionModel = require('../../models/mongoose/extensions')
const extensionuserModel = require('../../models/mongoose/extensionusers')
const userModel = require('../../models/mongoose/users')
const _helper = require('../../Helpers/helpers')



module.exports.createExtensionOwner = async (body) =>{
    let errResponse = {
        "status":false,
        message :"Error while creating Extension Owner",
        payload:{}
    }
    let successResponse ={
        "status":true,
        message :"Extension Owner created successfully",
        payload:{}
    }
    try{
        const { email, first_name, last_name,balance,manage_banner,admin_id } = body
        if(balance < 0 || balance == "-0"){
            errResponse.message = "Enter a valid balance"
            return errResponse
        }
        const hash = await _helper.utility.common.encryptPassword(10, '123456')
        let payload = {
            name: {
                first_name: first_name ? first_name : "",
                last_name: last_name ? last_name : ""
            },
            email: email.toLowerCase(),
            password: hash,
            user_type : 3,
            associated_admin_id : admin_id,
            balance,
            manage_banner : manage_banner ? manage_banner : false 

        }
        let checkIfEmailExists = await userModel.findOne({email : payload.email, is_deleted : false})
        let admin     = await userModel.findOne({ _id : payload.associated_admin_id})
        if(!checkIfEmailExists && admin.balance >= 1) {
            let userData = await userModel.create(payload)
            if(!userData){
                errResponse.payload = err;
                return errResponse;
            }
            if (userData) {
                userModel.updateOne(
                    { _id : payload.associated_admin_id},
                    { $set: {balance : admin.balance - 1}},
                    (err, writeResult) => {}
                    );
                successResponse.payload = userData;
                return successResponse;
            }
        }else{
            errResponse.message = "Email already exist or you don't have enough balance";
            return errResponse;
        }
    }catch(error){
        errResponse.payload = err;
        return errResponse;
    }
}




module.exports.manageExtensionOwner = async (extension_owner_id,extensionOwnerDetails,scenario) => {
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
        (scenario == "suspend") ? (queryValue = 0,setValue = 2,extension_status = false) : "";
        (scenario == "unsuspend") ? (queryValue = 2,setValue = 0,extension_status = true) : "";
        (scenario == "delete") ? (queryValue = false,setValue = true,extension_status = false) : "";
        let scenarioString = (scenario == "delete") ? "is_deleted" : "suspended_by";
        extensionOwnerDetails[scenarioString] = setValue;
        let extensionDetails = await extensionModel.findOne({"extension_owner_id" :extension_owner_id,"is_active" : !extension_status})
        if(extensionDetails){
            extensionDetails.is_active = extension_status;
            extensionDetails.save();
            let associateExtensionUsers = await extensionuserModel.find()
                        .elemMatch("associated_extension_details",{extension_owner_id:extension_owner_id});
            
            if(!associateExtensionUsers){
                console.log("or here")
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
                        if((cur_extn.extension_owner_id.equals(extension_owner_id)) && (cur_extn[scenarioString] == queryValue)){
                            console.log("Its comming here");
                            extensionuserModel.updateOne(
                                {_id:cur_user._id,"associated_extension_details.extension_owner_id":extension_owner_id},
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
        }
        if (scenario == "delete") {
            userModel.updateOne(
                { _id : extensionOwnerDetails.associated_admin_id},
                { $inc: {balance : 1}},
                (err, writeResult) => {}
                );
        }
            extensionOwnerDetails.save();
            successResponse.payload = {
                extensionOwnerDetails,
                extensionDetails
            }
            return successResponse
    }catch(err){
        console.log("err",err)
        errResponse.payload = err;
        return errResponse;
    }
}