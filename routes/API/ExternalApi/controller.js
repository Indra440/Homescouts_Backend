
const extensions = require('../../../models/mongoose/extensions');
const userModel = require('../../../models/mongoose/users')
const _helper = require('../../../Helpers/helpers')
const extensionModel = require('../../../models/mongoose/extensions');
const extensionuserModel = require('../../../models/mongoose/extensionusers');
const mongoose = require('mongoose');
const buttonModel = require('../../../models/mongoose/buttons');
const bannerModel = require('../../../models/mongoose/banners');



module.exports.createAdmin = async (req, res) => {
    try {
        const payload =  req.body
        let response = await _helper.utility.admin.createAdmin(payload)
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: response.message,
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: response.message,
                payload: response.payload
            })

    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while creating Extension owner",
            payload: error
        })
    }
}

module.exports.suspendAdmin = async (req,res) =>{
    try {
        let adminDetails = req.adminDetails;
        let admin_id = adminDetails._id;
        let response = await _helper.utility.admin.manageAdminProcess(admin_id,adminDetails,'suspend')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while suspending admin",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Admin suspended successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while suspending admin",
            payload: error
        })
    }
}

module.exports.unsuspendAdmin = async (req,res) =>{
    try {
        let adminDetails = req.adminDetails;
        let admin_id = adminDetails._id;
        let response = await _helper.utility.admin.manageAdminProcess(admin_id,adminDetails,'unsuspend')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while unsuspending admin",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Admin unsuspended successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while unsuspending admin",
            payload: error
        })
    }
}

module.exports.deleteAdmin = async (req,res) =>{
    try {
        let adminDetails = req.adminDetails;
        let admin_id = adminDetails._id;
        let response = await _helper.utility.admin.manageAdminProcess(admin_id,adminDetails,'delete')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while deleting admin",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Admin deleted successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while deleting admin",
            payload: error
        })
    }
}

module.exports.createExtensionOwner = async (req, res) => {
    try {
        const payload =  req.body
        payload.admin_id = req.body.token;
        let response = await _helper.utility.extensionOwner.createExtensionOwner(payload)
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: response.message,
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: response.message,
                payload: response.payload
            })

    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while creating Extension owner",
            payload: error
        })
    }
}

module.exports.suspendExtensionOwner = async (req,res) =>{
    try {
        let extensionOwnerDetails = req.extensionOwnerDetails;
        let extension_owner_id = extensionOwnerDetails._id;
        let response = await _helper.utility.extensionOwner.manageExtensionOwner(extension_owner_id,extensionOwnerDetails,'suspend')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while suspending Extension owner",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Extension owner suspended successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while suspending Extension owner",
            payload: error
        })
    }
}

module.exports.unsuspendExtensionOwner = async (req,res) =>{
    try {
        let extensionOwnerDetails = req.extensionOwnerDetails;
        let extension_owner_id = extensionOwnerDetails._id;
        let response = await _helper.utility.extensionOwner.manageExtensionOwner(extension_owner_id,extensionOwnerDetails,'unsuspend')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while unsuspending Extension owner",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Extension owner unsuspended successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while unsuspending Extension owner",
            payload: error
        })
    }
}

module.exports.deleteExtensionOwner = async (req,res) =>{
    try {
        let extensionOwnerDetails = req.extensionOwnerDetails;
        let extension_owner_id = extensionOwnerDetails._id;
        let response = await _helper.utility.extensionOwner.manageExtensionOwner(extension_owner_id,extensionOwnerDetails,'delete')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while deleting Extension owner",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Extension owner deleted successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while deleting Extension owner",
            payload: error
        })
    }
}

module.exports.createExtensionUser = async (req, res) => {
    try {
        const payload =  req.body
        let response = await _helper.utility.extensionUser.createExtensionUser(payload)
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status:response.status,
                    message: response.message,
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status:response.status,
                message: response.message,
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status:false,
            message: "Error occured while creating Extension owner",
            payload: error
        })
    }
}

module.exports.suspendExtensionUser = async (req, res) => {
    try {
        const extension_owner_id = req.body.token;
        const extensionouser_id = req.extensionouser_id;
        const extension_id = req.body.extension_token;
        let response = await _helper.utility.extensionUser.manageExtensionUser(extension_id,extension_owner_id,extensionouser_id,'suspend')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while suspending Extension user",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Extension User suspended successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while suspending Extension user",
            payload: error
        })
    }
}

module.exports.unsuspendExtensionUser = async (req, res) => {
    try {
        const extension_owner_id = req.body.token;
        const extensionouser_id = req.extensionouser_id;
        const extension_id = req.body.extension_token;
        let response = await _helper.utility.extensionUser.manageExtensionUser(extension_id,extension_owner_id,extensionouser_id,'unsuspend')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while unsuspending Extension user",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Extension User unsuspended successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while unsuspending Extension user",
            payload: error
        })
    }
}

module.exports.deleteExtensionUser = async (req, res) => {
    try {
        const extension_owner_id = req.body.token;
        const extensionouser_id = req.extensionouser_id;
        const extension_id = req.body.extension_token;
        let response = await _helper.utility.extensionUser.manageExtensionUser(extension_id,extension_owner_id,extensionouser_id,'delete')
            if(response.status == false){
                return res.status(200).send({
                    code: 4,
                    status: response.status,
                    message: "Error while deleting Extension user",
                    payload: response.payload
                })
            }
            return res.status(200).send({
                code: 1,
                status: response.status,
                message: "Extension User deleted successfully",
                payload: response.payload
            })
    } catch (error) {
        res.status(200).send({
            code: 4,
            status: false,
            message: "Error occured while deleting Extension user",
            payload: error
        })
    }
}

module.exports.modifiedextensionModelForBanner = async (req, res) => {
    try {

        const findAllCeo = await userModel.find({user_type : 3,is_deleted : false}).lean();
        if(!findAllCeo){
            res.status(500).send({
                code: 4,
                status: false,
                message: "Error occured while fetching Extension Owner",
            })
        }
        console.log("Total CEO ",findAllCeo.length);
        for(let i=0 ;i<findAllCeo.length;i ++){
            console.log("Current CEO ",findAllCeo[i]);

            let findExtension = await extensionModel.findOne({extension_owner_id : findAllCeo[i]._id,is_active : true});
            let findBanner = await bannerModel.findOne({owner_id :findAllCeo[i]._id,is_active : true });
            if(findExtension && findExtension !=null && findExtension != undefined && 
                findBanner && findBanner != null && findBanner != undefined){
                    findExtension.global_banner = findBanner._id;
                await findExtension.save();    
            }
            let finalBalance = 1;
            findExtension && findExtension !=null && findExtension != undefined ? finalBalance = 0 : finalBalance = 1;
            await userModel.updateOne({_id:findAllCeo[i]._id},{$set:{balance : finalBalance}})
            if(i == (findAllCeo.length-1)){
                return res.status(200).send({
                    code: 1,
                    status: true,
                    message: "Extension model modified successfully",
                })
            }
        }
    } catch (error) {
        console.log("Error ",error);
        res.status(500).send({
            code: 4,
            status: false,
            message: "Error occured while modified extension Model For Banner",
        })
    }
}