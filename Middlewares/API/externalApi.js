
const userModel = require('../../models/mongoose/users');
const extensionModel = require('../../models/mongoose/extensions');
const extensionUserModel = require('../../models/mongoose/extensionusers');


module.exports.createAdmin = async (req,res,next) =>{
    try{
        const token = req.body.token;
        const admin_email = req.body.email
        let findSuperAdmin = await userModel.findOne({_id:token,user_type:1,is_deleted:false,suspended_by:0})
        if(!findSuperAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findAdmin = await userModel.findOne({email:admin_email,is_deleted:false})
        if(findAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Admin is already existed",
                payload : {}
            })
        }
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while createting Admin",
            payload : err
        })
    }
}

module.exports.suspendAdmin = async (req,res,next) =>{
    try{
        const {token,email} = req.body;
        let findSuperAdmin = await userModel.findOne({_id:token,user_type:1,is_deleted:false,suspended_by:0})
        if(!findSuperAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findAdmin = await userModel.findOne({email:email,user_type:2,is_deleted:false,suspended_by:0})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Admin is not existed or already suspended",
                payload : {}
            })
        }
        req.adminDetails = findAdmin;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while suspending Admin",
            payload : err
        })
    }
}

module.exports.unsuspendAdmin = async (req,res,next) =>{
    try{
        const {token,email} = req.body;
        let findSuperAdmin = await userModel.findOne({_id:token,user_type:1,is_deleted:false,suspended_by:0})
        if(!findSuperAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findAdmin = await userModel.findOne({email:email,user_type:2,is_deleted:false,suspended_by:1})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                message :" Admin is not existed or already unsuspended",
                payload : {}
            })
        }
        req.adminDetails = findAdmin;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while unsuspending admin",
            payload : err
        })
    }
}

module.exports.deleteAdmin = async (req,res,next) =>{
    try{
        const {token,email} = req.body;
        let findSuperAdmin = await userModel.findOne({_id:token,user_type:1,is_deleted:false,suspended_by:0})
        if(!findSuperAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findAdmin = await userModel.findOne({email:email,user_type:2,is_deleted:false})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                message :" Admin is not existed or already deleted",
                payload : {}
            })
        }
        req.adminDetails = findAdmin;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while deleting Admin",
            payload : err
        })
    }
}

module.exports.createExtensionOwner = async (req,res,next) =>{
    try{
        const token = req.body.token;
        const owner_email = req.body.email
        let findAdmin = await userModel.findOne({_id:token,user_type:2,is_deleted:false,suspended_by:0})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                status: false,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionOwner = await userModel.findOne({email:owner_email,is_deleted:false})
        if(findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                status: false,
                message :"Extension owner is already existed",
                payload : {}
            })
        }
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while createting Extension Owner",
            payload : err
        })
    }
}

module.exports.suspendExtensionOwner = async (req,res,next) =>{
    try{
        const {token,email} = req.body;
        let findAdmin = await userModel.findOne({_id:token,user_type:2,is_deleted:false,suspended_by:0})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionOwner = await userModel.findOne({email:email,user_type:3,is_deleted:false,suspended_by:0})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                message :"Extension owner is not existed or already suspended",
                payload : {}
            })
        }
        req.extensionOwnerDetails = findExtensionOwner;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while suspending Extension owner",
            payload : err
        })
    }
}

module.exports.unsuspendExtensionOwner = async (req,res,next) =>{
    try{
        const {token,email} = req.body;
        let findAdmin = await userModel.findOne({_id:token,user_type:2,is_deleted:false,suspended_by:0})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionOwner = await userModel.findOne({email:email,user_type:3,is_deleted:false,suspended_by:2})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                message :"Extension owner is not existed or already suspended",
                payload : {}
            })
        }
        req.extensionOwnerDetails = findExtensionOwner;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while unsuspending Extension owner",
            payload : err
        })
    }
}

module.exports.deleteExtensionOwner = async (req,res,next) =>{
    try{
        const {token,email} = req.body;
        let findAdmin = await userModel.findOne({_id:token,user_type:2,is_deleted:false,suspended_by:0})
        if(!findAdmin){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionOwner = await userModel.findOne({email:email,user_type:3,is_deleted:false})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                message :"Extension owner is not existed or already deleted",
                payload : {}
            })
        }
        req.extensionOwnerDetails = findExtensionOwner;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while deleting Extension owner",
            payload : err
        })
    }
}

module.exports.createExtensionUser = async (req,res,next) =>{
    try{
        const owner_id = req.body.token;
        const user_email = req.body.email;
        const extension_token = req.body.extension_token;
        let findExtensionOwner = await userModel.findOne({_id:owner_id,user_type:3,is_deleted:false,suspended_by:0})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                status: false,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        const extension = await extensionModel.findOne({_id:extension_token,extension_owner_id:owner_id,is_active:true})
        if(!extension){
            return res.status(500).send({
                code    : 3,
                status: false,
                message : "You dont have any active extension to create user",
                payload : {}
            })
        }
        let userExist = await extensionUserModel.findOne({"email":user_email.toLowerCase()})
                        .elemMatch('associated_extension_details',{extension_id:extension._id,is_deleted:false})
        if(userExist){
            return res.status(200).send({
                code    : 3,
                status: false,
                message :"Extension user is already existed",
                payload : {}
            })
        }
        req.body.extension_id = extension._id;
        req.body.extension_owner_id = owner_id;
        req.body.admin_id = findExtensionOwner.associated_admin_id;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while createting Extension Owner",
            payload : err
        })
    }
}

module.exports.suspendExtensionUser = async (req,res,next) =>{
    try{
        const {token,email,extension_token} = req.body;
        let findExtensionOwner = await userModel.findOne({_id:token,user_type:3,is_deleted:false,suspended_by:0})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionUser = await extensionUserModel.findOne({email:email})
                    .elemMatch("associated_extension_details",{extension_id :extension_token,extension_owner_id:token,is_deleted:false,suspended_by:0});
        if(!findExtensionUser){
            return res.status(200).send({
                code    : 3,
                message :"Extension user is not existed or already suspended",
                payload : {}
            })
        }
        req.extensionouser_id = findExtensionUser._id;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while suspending Extension user",
            payload : err
        })
    }
}

module.exports.unsuspendExtensionUser = async (req,res,next) =>{
    try{
        const {token,email,extension_token} = req.body;
        let findExtensionOwner = await userModel.findOne({_id:token,user_type:3,is_deleted:false,suspended_by:0})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionUser = await extensionUserModel.findOne({email:email})
                    .elemMatch("associated_extension_details",{extension_id :extension_token,extension_owner_id:token,is_deleted:false,suspended_by:3});
        if(!findExtensionUser){
            return res.status(200).send({
                code    : 3,
                message :"Extension user is not existed or already unsuspended",
                payload : {}
            })
        }
        req.extensionouser_id = findExtensionUser._id;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while unsuspending Extension user",
            payload : err
        })
    }
}

module.exports.deleteExtensionUser = async (req,res,next) =>{
    try{
        const {token,email,extension_token} = req.body;
        let findExtensionOwner = await userModel.findOne({_id:token,user_type:3,is_deleted:false,suspended_by:0})
        if(!findExtensionOwner){
            return res.status(200).send({
                code    : 3,
                message :"Token is not existed or not have permission",
                payload : {}
            })
        }
        let findExtensionUser = await extensionUserModel.findOne({email:email})
                    .elemMatch("associated_extension_details",{extension_id :extension_token,extension_owner_id:token,is_deleted:false});
        if(!findExtensionUser){
            return res.status(200).send({
                code    : 3,
                message :"Extension user is not existed or already deleted",
                payload : {}
            })
        }
        req.extensionouser_id = findExtensionUser._id;
        next();
    }catch(err){
        return res.status(200).send({
            code    : 3,
            message :"Error while deleting Extension user",
            payload : err
        })
    }
}
