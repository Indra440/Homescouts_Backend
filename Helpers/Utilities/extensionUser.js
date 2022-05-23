const extensionuserModel = require('../../models/mongoose/extensionusers');
// const extensionModel = require('../../models/mongoose/extensions');
const _helper = require('../../Helpers/helpers');


module.exports.createExtensionUser = async (body) =>{
    let errResponse = {
        "status":false,
        message :"Error while creating Extension user",
        payload:{}
    }
    let successResponse ={
        "status":true,
        message :"Extension user created successfully",
        payload:{}
    }
    try{
        const {first_name,last_name,email,extension_id,extension_owner_id,admin_id} = body;
        const hash = await _helper.utility.common.encryptPassword(10, '123456')
        let userExist = await extensionuserModel.findOne({"email":email.toLowerCase()})
        if(!userExist){
            const payload ={
                name:{
                    first_name : first_name ? first_name : "",
                    last_name : last_name ? last_name : "",
                },
                email : email.toLowerCase(),
                associated_extension_details :[{
                    extension_owner_id: extension_owner_id,
                    admin_id: admin_id,
                    password : hash,
                    extension_id : extension_id
                }]
            }
            const data = await extensionuserModel.create(payload)
                    if(!data){
                        errResponse.payload = err;
                        return errResponse;
                    }
                    successResponse.payload = data;
                    return successResponse;
        }else{
            let cur_associated_extension_details = userExist.associated_extension_details;
            let paylod = {
                extension_owner_id: extension_owner_id,
                password : hash,
                admin_id: admin_id,
                extension_id : extension_id
            }
            cur_associated_extension_details.push(paylod);
            let result = await extensionuserModel.updateOne(
                {"email":email.toLowerCase()},
                {$set:{associated_extension_details:cur_associated_extension_details}})
                    if(!result){
                        errResponse.payload = err;
                        return errResponse;
                    }
                    successResponse.payload = result;
                    return successResponse;
        }
    }catch(err){
        errResponse.payload = err;
        return errResponse;
    }
}



module.exports.manageExtensionUser = async (extension_id,extension_owner_id,extensionouser_id,scenario) =>{
    let errResponse = {
        "status":false,
        payload:{}
    }
    let successResponse ={
        "status":true,
        payload:{}
    }
    try{
        let queryValue,setValue
        (scenario == "suspend") ? (queryValue = 0,setValue = 3) : "";
        (scenario == "unsuspend") ? (queryValue = 3,setValue = 0) : "";
        (scenario == "delete") ? (queryValue = false,setValue = true) : "";
        let scenarioString = (scenario == "delete") ? "is_deleted" : "suspended_by";

        let associateExtensionUser = await extensionuserModel.findOne({_id:extensionouser_id})
                        .elemMatch("associated_extension_details",{extension_id :extension_id,extension_owner_id:extension_owner_id});
            if(!associateExtensionUser){
                return errResponse
            }
            let associated_extension_details = associateExtensionUser.associated_extension_details;
            if(associated_extension_details.length > 0){
                let update = {$set:{}};
                if(scenario == "delete"){
                    update.$set["associated_extension_details.$.is_deleted"] = setValue;
                }else{
                    update.$set["associated_extension_details.$.suspended_by"] = setValue;
                }
                for(let i=0 ;i <associated_extension_details.length; i++){
                    cur_extn = associated_extension_details[i];
                    if( (cur_extn.extension_id.equals(extension_id)) && 
                            (cur_extn.extension_owner_id.equals(extension_owner_id)) && (cur_extn[scenarioString] == queryValue)){
                        console.log("Its comming here");
                        console.log("cur_extn.extension id",cur_extn.extension_id);
                        let UpdateExtensionUser = await extensionuserModel.updateOne(
                            {_id:extensionouser_id,"associated_extension_details.extension_id":cur_extn.extension_id},
                            update)
                                if(!UpdateExtensionUser){
                                    return errResponse;
                                }else{
                                    cur_extn[scenarioString] = setValue;
                                    associated_extension_details = [];
                                    associated_extension_details.push(cur_extn);
                                    successResponse.payload = {
                                        associated_extension_details,
                                    }
                                    return successResponse
                                }
                    }
                }
            }
    }catch(err){
        errResponse.payload = err;
        return errResponse;
    }
}