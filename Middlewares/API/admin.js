const config       = require('config')
const jsonwebtoken = require('jsonwebtoken')
const API_TOKEN    = config.get('api-token')
const userModel = require('../../models/mongoose/users');
const categoryModel = require('../../models/mongoose/categories');
const bannerModel = require('../../models/mongoose/banners');
const extensionModel = require('../../models/mongoose/extensions');
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const mongoose = require('mongoose');


/**
 * Middleware to save user info and permessions info in req.user object
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
// module.exports.  haveAccess = async(req,res,next) => {
//     const {Admin, Manager, Agent} = req.user.permissions
   
//     //console.log(Manager.includes())
    
//     console.log("Have access ----------- req.user.permissions",req.user.permissions)
//     //console.log("admin.permission.icludes",Admin.permissions.includes("Create"))
//     console.log(req.body.role)
//     console.log(req.user.userRoleId)
//     switch(req.user.role) {
//         case 1 :
//           if(Admin.permissions.includes("Create") || Admin.permissions.includes("All")) {
//               return next()
//           }else {
//               res.send({
//                   code    : 3,
//                   message : "You dont have valid permession"
//               })
//           }
//         break
        
//         case 2 :
//           if(Manager.permissions.includes("Create") || Manager.permissions.includes("All")) {
//               console.log("i m here")
//               return next()
//           }else {
//             res.send({
//                 code    : 3,
//                 message : "You dont have valid permession"
//             })
//         }
//         break

//         case 3 :
//           if(Agent.permissions.includes("Create") || Agent.permissions.includes("All")) {
//               return next()
//           }else {
//             res.send({
//                 code    : 3,
//                 message : "You dont have valid permession"
//             })
//         }
//         break

//         default :
//             res.send({
//                 code    : 4,
//                 message : "This Role is not registerd in haveAccess middleware"
//             })
//     }
// }

module.exports.uploadBanner = async (req,res,next) =>{
    try{
        console.log("in upload banner middleware")
        const {link, category_id,extension_id} = req.body;
        const owner_id = req.user.user.id;
        let ownerExist = await userModel.findOne({_id:owner_id});
        if(!ownerExist){
            await unlinkAsync(req.file.path);
            res.status(500).send({
                code: 4,
                message: "User is not existed",
                payload: {}
            })
            return;
        }
        let query = {};
        (ownerExist.user_type == 3) ? query.name = "Global" : query._id = category_id;
        let categoryExist = await categoryModel.findOne(query);
        if(!categoryExist){
            await unlinkAsync(req.file.path);
            res.status(500).send({
                code: 4,
                message: "Provide a valid category",
                payload: {}
            })
            return;
        }
        req.categoryDetails = categoryExist;
        if((ownerExist.user_type == 3)){
            const findExtension = await extensionModel.findOne({_id:extension_id,is_active : true});
                if(!findExtension){
                    await unlinkAsync(req.file.path);
                    res.status(500).send({
                        code: 4,
                        message: "Extension not found or inactive",
                        payload: {}
                    })
                    return;
                }
            req.extensionDetails = findExtension
        }
        if(ownerExist.user_type == 2 ||ownerExist.user_type == 3){
            if((ownerExist.user_type == 3) && (ownerExist.manage_banner != true)){
                await unlinkAsync(req.file.path);
                res.status(500).send({
                    code: 4,
                    message: "You dont have permission to add Banner",
                    payload: {}
                })
                return;
            }
            next();
        }else{
            await unlinkAsync(req.file.path);
            res.status(500).send({
                code: 4,
                message: "You dont have permission to add Banner",
                payload: {}
            })
            return;
        }
    }catch(err){
        await unlinkAsync(req.file.path);
        return res.status(500).send({
            code: 4,
            message: "Error occur while uploading banner",
            payload: err
        })
    }
    
}

module.exports.editBanner = async (req,res,next) =>{
    console.log("Came in edit banner middleware")
    const {link, category_id, banner_id} = req.body;
    const owner_id = req.user.user.id;
    let categoryExist = await categoryModel.findOne({_id: mongoose.Types.ObjectId(String(category_id))});
    if(!categoryExist) {
        if(req.file) {
            await unlinkAsync(req.file.path);
        }
        return res.status(500).send({
            code: 4,
            message: "Provide a valid category",
            payload: {}
        })
    }

    let bannerExist = await bannerModel.findOne({_id:  mongoose.Types.ObjectId(String(banner_id))});
    if(!bannerExist){

        if(req.file) {
            await unlinkAsync(req.file.path);
        }
        return res.status(500).send({
            code: 4,
            message: "Provide a valid banner ID",
            payload: {}
        })
    }

    req.categoryDetails = categoryExist;
    let ownerExist = await userModel.findOne({_id: mongoose.Types.ObjectId(String(owner_id))});
    if(!ownerExist){
        if(req.file) {
            await unlinkAsync(req.file.path);
        }
        return res.status(500).send({
            code: 4,
            message: "User is not existed",
            payload: {}
        })
    }
    if(ownerExist.user_type == 2 ||ownerExist.user_type == 3){
        if((ownerExist.user_type == 3) && (ownerExist.manage_banner != true)){
            if(req.file) {
                await unlinkAsync(req.file.path);
            }
            return res.status(500).send({
                code: 4,
                message: "You dont have permission to add Banner",
                payload: {}
            })
        }
        next();
    }else{
        if(req.file) {
            await unlinkAsync(req.file.path);
        }
        return res.status(500).send({
            code: 4,
            message: "You dont have permission to add Banner",
            payload: {}
        })
    }
}

module.exports.toggleBanner = async (req,res,next) =>{
    try{
        let banner_id = req.body.banner_id;
        let owner_id = req.user.user.id;
        // let bannerDetails = await bannerModel.findOne({_id:banner_id,owner_id:owner_id,is_deleted:false,is_active:false})
        let bannerDetails = await bannerModel.findOne({_id:banner_id,owner_id:owner_id,is_deleted:false})
        if(!bannerDetails){
            return res.status(500).send({
                code: 4,
                message: "Banner not found to activate or already activated",
                payload: {}
            })
        }
        let category_id = bannerDetails.category_id;
        let category_details = await categoryModel.findOne({_id:category_id})
        if(!category_details){
            return res.status(500).send({
                code: 4,
                message: "Category not found for the banner",
                payload: {}
            })
        }
        /**
         * @working_dev
         * Adding the validations here for the extension user also as the api is same for admins and extension users
         * extension owner user type is 3
         */
        let getUserType = req.user.user.user_type;
        if(category_details.name == "Global" && getUserType != 3){
            return res.status(500).send({
                code: 4,
                message: "status change is not possible for global category",
                payload: {}
            })
        }
        req.banner_details = bannerDetails
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while activate banner",
            payload: err
        })
    }
}


module.exports.suspendAdmin = async (req,res,next) =>{
    try{
        let admin_id = req.body.admin_id;
        let adminDetails = await userModel.findOne({_id:admin_id,suspended_by:0,is_deleted:false,user_type:2})
        if(!adminDetails){
            return res.status(500).send({
                code: 4,
                message: "Admin not found to suspend",
                payload: {}
            })
        }
        req.adminDetails = adminDetails;
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while suspending admin",
            payload: {}
        })
    }
}

module.exports.unsuspendAdmin = async (req,res,next) =>{
    try{
        let admin_id = req.body.admin_id;
        let adminDetails = await userModel.findOne({_id:admin_id,suspended_by:1,is_deleted:false,user_type:2})
        if(!adminDetails){
            return res.status(500).send({
                code: 4,
                message: "Admin not found to unsuspend",
                payload: {}
            })
        }
        req.adminDetails = adminDetails;
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while suspending admin",
            payload: {}
        })
    }
}

module.exports.deleteAdmin = async (req,res,next) =>{
    try{
        let admin_id = req.body.admin_id;
        let adminDetails = await userModel.findOne({_id:admin_id,is_deleted:false,user_type:2})
        if(!adminDetails){
            return res.status(500).send({
                code: 4,
                message: "Admin not found to delete",
                payload: {}
            })
        }
        req.adminDetails = adminDetails;
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while suspending admin",
            payload: {}
        })
    }
}




// function isAuthorized(req,res,next){
//     console.log(req.headers);
//     // console.log(req.headers.authorization.split(' ')[0])
//     if(req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT'){
     
//         jsonwebtoken.verify(req.headers.authorization.split(' ')[1],'secret',function(err,decode){
//             console.log("error",err)
//             if(err) req.user = undefined;
            
//             req.user = decode;
//             console.log("req.user",req.user)
//             next();
//         })
//     }else{
//         req.user = undefined
//         next()
//     }

// }
