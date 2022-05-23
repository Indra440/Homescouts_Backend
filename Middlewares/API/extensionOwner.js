const userModel = require('../../models/mongoose/users');
const config = require('config')
var multer  = require('multer');
const extensionsModel = require('../../models/mongoose/extensions');
const categoryModel = require('../../models/mongoose/categories');
const extensionOwner = require("../../models/mongoose/users")
const buttonModel = require("../../models/mongoose/buttons")

const _helper = require('../../Helpers/helpers');
const fs = require("fs");
const { promisify } = require("util");
const mongoose = require('mongoose');
const { nextTick } = require('process');
const unlinkAsync = promisify(fs.unlink);


module.exports.editExtensionOwner = async (req,res,next) =>{
    try{
        const {extension_owner_id,email} = req.body;
        const admin_id = req.user.user.id;
        const extensionOwnerDetails = await userModel.findOne({_id:extension_owner_id,user_type:3,associated_admin_id:admin_id,is_deleted:false,suspended_by:0});
        if(!extensionOwnerDetails){
            return res.status(500).send({
                code: 4,
                message: "Extension owner not found",
                payload: {}
            })
        }
        if(extensionOwnerDetails.email != email){
            const newextensionOwnerDetails = await userModel.findOne({email:email,user_type:3,is_deleted:false});
            if(newextensionOwnerDetails){
                return res.status(500).send({
                    code: 4,
                    message: "This email id is already existed",
                    payload: {}
                })
            }else{
                req.extensionOwnerDetails = extensionOwnerDetails;
                next();
            }
        }else{
            req.extensionOwnerDetails = extensionOwnerDetails;
            next();
        }
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while exditing Extension Owner",
            payload: err
        })
    }
}

module.exports.suspendExtensionOwner = async (req,res,next) =>{
    try{
        let admin_id = req.user.user.id;
        let extensionowner_id = req.body.extensionowner_id;
        let response = await controlExtensionOwner(admin_id,extensionowner_id,"suspend")
        if(response.status == false){
            return res.status(500).send({
                code: 4,
                message:response.message ,
                payload: {}
            })
        }
        req.extensionOwnerDetails = response.payload;
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while suspending Extension Owner",
            payload: err
        })
    }
}

module.exports.unsuspendExtensionOwner = async (req,res,next) =>{
    try{
        let admin_id = req.user.user.id;
        let extensionowner_id = req.body.extensionowner_id;
        let response = await controlExtensionOwner(admin_id,extensionowner_id,"unsuspend")
        if(response.status == false){
            return res.status(500).send({
                code: 4,
                message:response.message ,
                payload: {}
            })
        }
        req.extensionOwnerDetails = response.payload;
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while unsuspending Extension Owner",
            payload: {}
        })
    }
}

module.exports.getExtId = async (req, res, next) => {
    try{
        const userinfo = req.user.user
        const extension_id = req.body.extension_id;
        const owner = await extensionOwner.findOne({_id: mongoose.Types.ObjectId(userinfo.id), is_deleted: false})

        if(!owner) {
            return res.status(500).send({
                code    : 3,
                message : "Cannot find extension owner.",
                payload : {}
            })
        }

        const extension = await extensionsModel.findOne({_id:mongoose.Types.ObjectId(String(extension_id)),extension_owner_id : mongoose.Types.ObjectId(String(owner._id)), is_active: true})
        if(!extension) {
            return res.status(500).send({
                code    : 3,
                message : "Cannot find extension info.",
                payload : {}
            })
        }
        req.user.user.extensionOwner = owner
        req.user.user.extension = extension
        next()
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while performing this operation",
            payload: {}
        })
    }
}

const testUrlValidity = (url) => {
    // const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi; 
    const regex = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ //port
            '(\\?[;&amp;a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i');
    // const regex = new RegExp(expression); 
    return regex.test(url)
}

module.exports.validateLabelAndLink = async (req, res, next) => {
    console.log("Came in validateLabelAndLink")
    try {
        const link = req.body.link
        if(!testUrlValidity(link)) {
            return res.status(500).send({
                code    : 2,
                message : "Url provided is incorrect.",
                payload : {}
            })
        }
        const label = String(req.body.label)
        if(label.trim().length <=2) {
            return res.status(500).send({
                code    : 2,
                message : "Label should be atleast greater than 2 letters.",
                payload : {}
            })
        }
        next()
    } catch(e) {
        return res.status(500).send({
            code    : 3,
            message : "Our servers are busy for a while. Try after some time.",
            payload : {}
        })
    }
}

module.exports.deleteExtensionOwner = async (req,res,next) =>{
    try{
        let admin_id = req.user.user.id;
        let extensionowner_id = req.body.extensionowner_id;
        let response = await controlExtensionOwner(admin_id,extensionowner_id,"delete")
        if(response.status == false){
            return res.status(500).send({
                code: 4,
                message:response.message ,
                payload: {}
            })
        }
        req.extensionOwnerDetails = response.payload;
        next();
    }catch(err){
        return res.status(500).send({
            code: 4,
            message: "Error occur while suspending Extension Owner",
            payload: {}
        })
    }
}

async function controlExtensionOwner(admin_id,extensionowner_id,scenario){
    let response = {};
    // let adminDetails = await userModel.findOne({_id:admin_id,suspended_by:0,is_deleted:false,user_type:2})
    // if(!adminDetails){
    //      response.status = false;
    //      response.message = "You dont have permission";
    //      return response;  
    // }
    let query = {
        _id : extensionowner_id,
        is_deleted : false,
        user_type: 3,
        associated_admin_id : admin_id
    }
    console.log("query ",query);
    (scenario == "suspend") ? query.suspended_by = 0 : "";
    (scenario == "unsuspend") ? query.suspended_by = 2 : "";
    let extensionOwnerDetails = await userModel.findOne(query)
    if(!extensionOwnerDetails){
        response.status = false;
        response.message = "Invalid operation";
        return response;  
    }
    response.status = true;
    response.payload = extensionOwnerDetails;
    return response;
}
module.exports.checkButtonExists = async (req, res, next) => {

    console.log("COmming to checkButtonExists middleware")
    try {
        const buttonId = req.body.buttonId
        const button = await buttonModel.findOne({
            _id : buttonId,
            extension_id : mongoose.Types.ObjectId(String(req.user.user.extension._id)),
            is_deleted: false
        })
        if(!button) {
            return res.status(500).send({
                code    : 3,
                message : "Cannot find button.",
                payload : {}
            })
        }
        req.user.user.button = button
        next()
    } catch(e) {
        return res.status(500).send({
            code    : 3,
            message : "Our servers are busy for a while. Try after some time.",
            payload : {}
        })
    }
}