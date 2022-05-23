const config = require('config')
var multer  = require('multer');
const extensionsModel = require('../../models/mongoose/extensions');
const categoryModel = require('../../models/mongoose/categories');
const userModel = require('../../models/mongoose/users');
const _helper = require('../../Helpers/helpers');
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

module.exports.uploadExtensionFile = async (req,res,next) =>{
    var upload = multer({
        dest: 'uploads/',
        limits: { fileSize: config.get("image-max-size") },
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        }
    }).fields(
        [
            {
                name:'small_icon', maxCount:1
            },
            {
                name:'medium_icon', maxCount:1
            },
            {
                name:'large_icon', maxCount:1
            },
            {
                name:'primary_logo', maxCount:1
            }
        ]
    );

    upload(req, res, function(err) {
        if(err) {
            res.send({
                status :false,
                error : err.message
            })
        }
        req.data = req.body
        console.log("Data ",req.data);
        next()
    })
}

module.exports.create = async (req,res,next) =>{
    try{
        const extension_owner_id = req.user.user.id;
        const {category_id,version} = req.body;
        const files = req.files;
        // const enable_signup = req.body.enable_signup;
        // const signup_link = req.body.signup_link;
        let checkExtensionOwner = await userModel.findOne({_id:extension_owner_id,user_type:3,is_deleted:false,suspended_by:0})
        if(!checkExtensionOwner ||checkExtensionOwner == null || checkExtensionOwner == undefined){
            await _helper.utility.extension.remove_all_files_for_extension(files)
            return res.status(500).send({
                code: 4,
                message: "User not found or alreday suspended/deleted",
                payload: {}
            })
        }
        if(!checkExtensionOwner.balance || checkExtensionOwner.balance <=0){
            await _helper.utility.extension.remove_all_files_for_extension(files)
            return res.status(500).send({
                code: 4,
                message: "You don't have enough balance to create extension",
                payload: {}
            })
        }
        let categoryDetails = await categoryModel.findOne({_id:category_id})
            if(!categoryDetails){
                await _helper.utility.extension.remove_all_files_for_extension(files)
                return res.status(500).send({
                    code: 4,
                    message: "Please select a valid category",
                    payload: {}
                })
            }else{
                if(categoryDetails.name == "Global"){
                    await _helper.utility.extension.remove_all_files_for_extension(files)
                    return res.status(500).send({
                        code: 4,
                        message: "You can't create an extension for global category",
                        payload: {}
                    })
                }
                    let version_array = version.split(".").map(Number);
                    let version_status = true;
                    if(version_array.length > 0 || version_array.length < 4){
                        version_array.map((cur_ver,index) =>{
                            if(isNaN(cur_ver)) version_status = false;
                            if((index == 0) && (cur_ver < 1)) version_status = false;
                            if((index > 0) && (cur_ver < 0)) version_status = false;
                        })                        
                    }else{
                        version_status = false;
                    }
                    if(!version_status){
                        await _helper.utility.extension.remove_all_files_for_extension(files)
                        return res.status(500).send({
                            code: 4,
                            message: "Please check the version number",
                            payload: {}
                        })
                    }
                    req.cur_user = checkExtensionOwner;
                    next()
                // if((enable_signup && signup_link =="") || (!enable_signup && signup_link !="")){
                //     await _helper.utility.extension.remove_all_files_for_extension(files)
                //     res.status(500).send({
                //         code: 4,
                //         message: "Please check you signup link and status",
                //         payload: {}
                //     })
                // }
            }
    }catch(error){
        await _helper.utility.extension.remove_all_files_for_extension(req.files)
        return res.status(500).send({
            code: 4,
            message: "Error occured while creating Extension",
            payload: error
        })
    }
}

module.exports.updateVersion = async (req,res,next) =>{
    const owner_id = req.user.user.id;
    const version = req.body.extensionVersion;
    const extension_id = req.body.extension_id;
    try{
        const extension = await extensionsModel.findOne({_id:extension_id,extension_owner_id:owner_id,is_active:true})
            if(!extension){
                res.status(500).send({
                    code: 4,
                    message: "Extension not found",
                    payload: {}
                })
            }
            let version_array = version.split(".").map(Number);
            let version_status = true;
            if(version_array.length > 0 || version_array.length < 4){
                version_array.map((cur_ver,index) =>{
                    if(isNaN(cur_ver)) version_status = false;
                    if((index == 0) && (cur_ver < 1)) version_status = false;
                    if((index > 0) && (cur_ver < 0)) version_status = false;
                })                        
            }else{
                version_status = false;
            }
            if(!version_status){
                res.status(500).send({
                    code: 4,
                    message: "Please provide a valid version number",
                    payload: {}
                })
            }else{
                req.extension_details = extension;
                next();
            }
    }catch(error){
        res.status(500).send({
            code: 4,
            message: "Error occured while updating version",
            payload: error
        })
    }
}

module.exports.updateLogo = async (req,res,next) =>{
    const owner_id = req.user.user.id;
    const file = req.file;
    const extension_id = req.body.extension_id;
    try{   
        const findUser = await userModel.findOne({_id:owner_id,user_type:3,is_deleted:false,suspended_by:0})
        if(!findUser){
            file ? await unlinkAsync(file.path) : "";
            res.status(500).send({
                code: 4,
                message: "User not found to update logo",
                payload: {}
            })
        }
        const extension = await extensionsModel.findOne({_id:extension_id,extension_owner_id:owner_id,is_active:true})
        if(!extension){
            file ? await unlinkAsync(file.path) : "";
            res.status(500).send({
                code: 4,
                message: "Extension not found to update logo",
                payload: {}
            })
        }
        req.extension_details = extension;
        next();
    }catch(err){
        file ? await unlinkAsync(file.path) : "";
        res.status(500).send({
            code: 4,
            message: "Error occured while updating Extension",
            payload: err
        })
    }
}

module.exports.uploadandupdatevideo = async (req,res,next)=>{
        const owner_id = req.user.user.id;
        const file = req.file;
        const extension_id = req.body.extension_id;
        const delay_time = req.body.delay_time;
    try{
        const findUser = await userModel.findOne({_id:owner_id,user_type:3,is_deleted:false,suspended_by:0})
        console.log("findUser ",findUser);
        if(!findUser){
            file ? await unlinkAsync(file.path) : "";
            res.status(500).send({
                code: 4,
                message: "User not found to upload video",
                payload: {}
            })
        }
        const extension = await extensionsModel.findOne({_id:extension_id,extension_owner_id:owner_id,is_active:true})
            if(!extension){
                res.status(500).send({
                    code: 4,
                    message: "You dont have any active extension",
                    payload: {}
                })
            }
            if(file && (findUser.manage_banner == false)){
                file ? await unlinkAsync(file.path) : "";
                res.status(500).send({
                    code: 4,
                    message: "You dont have permission to upload banner ",
                    payload: {}
                })
            }else{
                const videos = extension.videos;
                if(videos.length > 0 && (!delay_time || delay_time == undefined || delay_time == null)){
                    res.status(500).send({
                        code: 4,
                        message: "Please provide the delay time for this video",
                        payload: {}
                    })
                } 
                req.extension_id = extension._id;
                next()
            }
    }catch(error){
        file ? await unlinkAsync(file.path) : "";
        res.status(500).send({
            code: 4,
            message: "Error occured while upload video",
            payload: error
        })
    }
}

    module.exports.manageVideo = async (req,res,next)=>{
        const owner_id = req.user.user.id;
        try{
            const findUser = await userModel.findOne({_id:owner_id,user_type:3,is_deleted:false,suspended_by:0})
            if(!findUser){
                res.status(500).send({
                    code: 4,
                    message: "User not found to",
                    payload: {}
                })
            }
            next();
        }catch(error){
            res.status(500).send({
                code: 4,
                message: "Error occured while fetxhing video",
                payload: error
            })
        }
    }


    module.exports.updateSignupLink = async (req,res,next)=>{
        const owner_id = req.user.user.id;
        const {enable_signup,signup_link,extension_id} = req.body;
        try{
            const findUser = await userModel.findOne({_id:owner_id,user_type:3,is_deleted:false,suspended_by:0})
            if(!findUser){
                res.status(500).send({
                    code: 4,
                    message: "User not found to",
                    payload: {}
                })
            }
            const extension = await extensionsModel.findOne({_id:extension_id,extension_owner_id:owner_id,is_active:true})
            if(!extension){
                res.status(500).send({
                    code: 4,
                    message: "Extension not found",
                    payload: {}
                })
            }
            if(((enable_signup == true) && (signup_link == ""))){
                res.status(500).send({
                    code: 4,
                    message: "please add one signup link",
                    payload: {}
                })
            }
            req.extension_details = extension;
            next();
        }catch(error){
            res.status(500).send({
                code: 4,
                message: "Error occured while fetxhing video",
                payload: error
            })
        }
    }




function checkFileType(file, cb) {
    if (
        file.mimetype === 'image/png'||file.mimetype === 'image/jpeg'
        ) { // check file type to be png, jpeg, or jpg
        console.log("File type matched")
        cb(null, true);
    } else {
        console.log("file type didn't  matched")
        cb(null, false); // else fails
    }
}