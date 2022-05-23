
const extensionUserModel = require('../../models/mongoose/extensionusers')
const userModel = require('../../models/mongoose/users');
const extensionModel = require('../../models/mongoose/extensions');



module.exports.create = async (req,res,next)=>{
    try{
        const {firstName,lastName,email,extension_id} = req.body;
        const extension_owner_id = req.user.user.id;
        let owner_details = await userModel.findOne({_id:extension_owner_id,is_deleted:false,suspended_by:0})
        if(!owner_details){
            return res.status(500).send({
                code    : 3,
                message : "Owner is not existed or suspended",
                payload : {}
            })
        }
        const extension = await extensionModel.findOne({_id:extension_id,extension_owner_id:extension_owner_id,is_active:true})
        if(!extension){
            return res.status(500).send({
                code    : 3,
                message : "Extension not found to create user",
                payload : {}
            })
        }
        let userExist = await extensionUserModel.findOne({"email":email.toLowerCase()})
                        .elemMatch('associated_extension_details',{extension_id:extension._id,is_deleted:false})
        if(!userExist){
            // req.body.extension_id = extension._id;
            console.log("User exist",userExist);
            next()
        }else{
            return res.status(500).send({
                code    : 3,
                message : "User is alredy exist for this extension",
                payload : {}
            })
        }
    }catch(err){
        return res.status(500).send({
            code    : 3,
            message :"Error while createting user",
            payload : err
        })
    }
        
}

module.exports.manageExtensionUser = async (req,res,next) => {
    try{
        let extension_owner_id = req.user.user.id;
        const extensionouser_id = req.body.extensionouser_id;
        const extension_id = req.body.extension_id;
        let extensionOwnerDetails = await userModel.findOne({_id:extension_owner_id,is_deleted:false,suspended_by:0,user_type:3});
        if(!extensionOwnerDetails){
            return res.status(500).send({
                code    : 3,
                message :"User not found or you don't have permission",
                payload : {}
            })
        }
        let findExtensionUser = await extensionUserModel.findOne({_id:extensionouser_id})
                    .elemMatch("associated_extension_details",{extension_id :extension_id,extension_owner_id:extension_owner_id});
        if(!findExtensionUser){
            return res.status(200).send({
                code    : 3,
                message :"Extension user is not found for this extension",
                payload : {}
            })
        }
        next();
    }catch(error){
        return res.status(500).send({
            code    : 3,
            message :"Error while perform this operation",
            payload : error
        })
    }
}

module.exports.fetchUsefulLinks = async (req,res,next) => {
    try{
        const extension_user_id = req.user.user.id;
        const extension_id = req.user.user.extension_id;
        let extensionUserDetails = await extensionUserModel.findOne({_id:extension_user_id})
                    .elemMatch("associated_extension_details",{extension_id:extension_id,is_deleted:false,suspended_by:0})
        if(!extensionUserDetails){
            return res.status(500).send({
                code    : 3,
                message :"User not found or you are suspended",
                payload : {}
            })
        }
        let extensionDetails = await  extensionModel.findOne({_id:extension_id,is_active:true})
        if(!extensionDetails){
            return res.status(500).send({
                code    : 3,
                message :"This is not an active extension",
                payload : {}
            })
        }
        next();
    }catch(error){
        return res.status(500).send({
            code    : 3,
            message :"Error while perform this operation",
            payload : error
        })
    }
}


