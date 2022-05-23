
const extensions = require('../../../models/mongoose/extensions');
const userModel = require('../../../models/mongoose/users')
const _helper = require('../../../Helpers/helpers')
const extensionModel = require('../../../models/mongoose/extensions');
const extensionuserModel = require('../../../models/mongoose/extensionusers');
const mongoose = require('mongoose');
const buttonModel = require('../../../models/mongoose/buttons');
const bannerModel = require('../../../models/mongoose/banners');

const fs = require("fs");
const shortid = require("shortid");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

module.exports.create = async (req, res) => {
    try {
        let payload = req.body
        payload.admin_id = req.user.user.id;
        let response = await _helper.utility.extensionOwner.createExtensionOwner(payload)
        if (response.status == false) {
            return res.status(500).send({
                code: 4,
                message: response.message,
                payload: response.payload
            })
        }
        return res.status(200).send({
            code: 1,
            message: response.message,
            payload: response.payload
        })
    } catch (error) {
        res.status(500).send({
            code: 4,
            message: "Error occured while creating Extension owner",
            payload: error
        })
    }
}

module.exports.findAll = async (req, res) => {
    try {
        let limit = req.query.limit ? req.query.limit : 15;
        let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
        var query = { is_deleted: false, user_type: 3 };
        if(req.query.page) {
            query = { is_deleted: false, user_type: 3 },{}, { skip: page, limit: limit };
        }
        const loggedInUserType = req.user.user.user_type;
        loggedInUserType == 2 ? query.associated_admin_id = req.user.user.id : ""
        if ((loggedInUserType == 1) || (loggedInUserType == 2)) {
            let extensionOwners = await userModel.find(query).sort({createdAt: -1})
            let extensionOwnersLength = await userModel.find({
                is_deleted: false,
                user_type: 3,
                associated_admin_id : mongoose.Types.ObjectId(req.user.user.id)
            }).countDocuments();
            for (let i = 0; i < extensionOwners.length; i++) {
                let total_extension = await extensionModel.find({ extension_owner_id: extensionOwners[i]._id, is_active: true }).count()
                extensionOwners[i].set('total_extension_number', total_extension, { strict: false });
            }
            res.status(200).send({
                code: 1,
                status: true,
                message: "successfully fetched all Extension Owners",
                payload: extensionOwners,
                totalData : extensionOwnersLength
            })
        } else {
            res.status(500).send({
                code: 1,
                status: true,
                message: "You dont have permission",
                payload: []
            })
        }
    } catch (error) {
        res.status(500).send({
            code: 3,
            message: "Error occured while fetching all Extension Owners",
            payload: error
        })
    }
}

module.exports.editExtensionOwner = async (req, res) => {
    try {
        const { first_name, last_name, email, manage_banner } = req.body;
        let extensionOwnerDetails = req.extensionOwnerDetails;
        extensionOwnerDetails.name.first_name = first_name ? first_name : extensionOwnerDetails.name.first_name;
        extensionOwnerDetails.name.last_name = last_name ? last_name : extensionOwnerDetails.name.last_name;
        extensionOwnerDetails.email = email.toLowerCase();
        extensionOwnerDetails.manage_banner = manage_banner ? manage_banner : extensionOwnerDetails.manage_banner;
        extensionOwnerDetails.save();
        res.status(200).send({
            code: 1,
            status: true,
            message: "successfully save Extension Owner details",
            payload: extensionOwnerDetails
        })
    } catch (err) {
        res.status(500).send({
            code: 3,
            message: "Error occured while editing Extension Owners",
            payload: err
        })
    }
}

module.exports.suspendExtensionOwner = async (req, res) => {
    try {
        let extension_owner_id = req.body.extensionowner_id;
        let extensionOwnerDetails = req.extensionOwnerDetails;
        // console.log("extensionOwnerDetails",extensionOwnerDetails)
        let response = await _helper.utility.extensionOwner.manageExtensionOwner(extension_owner_id, extensionOwnerDetails, 'suspend')
        if (response.status == false) {
            return res.status(500).send({
                code: 4,
                message: "Error while suspending Extension Owner",
                payload: response.payload
            })
        }
        return res.status(200).send({
            code: 1,
            message: "Extension Owner suspended successfully",
            payload: response.payload
        })
    } catch (err) {
        res.status(500).send({
            code: 3,
            message: "Error occured while suspending Extension Owners",
            payload: err
        })
    }
}
module.exports.unsuspendExtensionOwner = async (req, res) => {
    try {
        let extension_owner_id = req.body.extensionowner_id;
        let extensionOwnerDetails = req.extensionOwnerDetails;
        let response = await _helper.utility.extensionOwner.manageExtensionOwner(extension_owner_id, extensionOwnerDetails, 'unsuspend')
        if (response.status == false) {
            return res.status(500).send({
                code: 4,
                message: "Error while unsuspending Extension Owner",
                payload: response.payload
            })
        }
        return res.status(200).send({
            code: 1,
            message: "Extension Owner unsuspended successfully",
            payload: response.payload
        })
    } catch (err) {
        res.status(500).send({
            code: 3,
            message: "Error occured while unsuspending Extension Owners",
            payload: err
        })
    }
}

module.exports.deleteExtensionOwner = async (req, res) => {
    try {
        let extension_owner_id = req.body.extensionowner_id;
        let extensionOwnerDetails = req.extensionOwnerDetails;
        let response = await _helper.utility.extensionOwner.manageExtensionOwner(extension_owner_id, extensionOwnerDetails, 'delete')
        if (response.status == false) {
            return res.status(500).send({
                code: 4,
                message: "Error while deleting Extension Owner",
                payload: response.payload
            })
        }
        return res.status(200).send({
            code: 1,
            message: "Extension Owner deleted successfully",
            payload: response.payload
        })
    } catch (err) {
        res.status(500).send({
            code: 3,
            message: "Error occured while deleting Extension Owners",
            payload: err
        })
    }
}

module.exports.updateBalance = async (req, res) => {
	try {
		const { extension_owner_id, balance } = req.body
		if(balance < 0 || balance == "-0"){
            res.status(500).send({
				code: 4,
				message: "Enter a valid balance",
				payload: {}
			})
        }else{
			userModel.updateOne(
				{ _id: extension_owner_id },
				{ $set: { balance: Math.round(balance) } },
				(err, writeResult) => {
					if (err) {
						res.status(500).send({
							code: 4,
							message: "Error occured while updating the balance.",
							payload: err
						})
					}
					res.status(200).send({
						code: 1,
						status: true,
						message: "successfully updated the balance.",
						payload: {}
					})
				}
			);
		}
	} catch (error) {
		res.status(500).send({
			code: 3,
			message: "Error occured while updating the balance.",
			payload: error
		})
	}
}

module.exports.fetchBannerStatus = async (req, res) => {
    console.log("IN fetchBannerStatus")
    try {
        let id = req.user.user.id
        let extensionOwner = await userModel.findOne({ _id: id, user_type: 3 })
        if (!extensionOwner) {
            return res.status(400).send({
                code: 5,
                message: "Not an extension owner",
                payload: {}
            })
        }
        return res.status(200).send({
            manage_banner: extensionOwner.manage_banner
        })
    } catch (error) {
        return res.status(500).send({
            code: 4,
            message: "Error occured while fetching manage banner status",
            payload: error
        })
    }
}



module.exports.manageBanner = async (req, res) => {
    try {
        const { extension_owner_id } = req.body
        let extensionOwner = await userModel.findOne({ _id: extension_owner_id, user_type: 3 })
        if (extensionOwner) {
            userModel.updateOne(
                { _id: extension_owner_id },
                { $set: { manage_banner: !extensionOwner.manage_banner } },
                (err, writeResult) => {
                    if (err) {
                        res.status(500).send({
                            code: 2,
                            status: false,
                            message: "Error while saving data",
                            payload: err
                        })
                    }
                    let message = extensionOwner.manage_banner ? "deactivated" : "activated";
                    res.status(200).send({
                        code: 1,
                        status: true,
                        message: `Manage banner ${message}`,
                        payload: {}
                    })
                }
            );
        } else {
            res.status(500).send({
                code: 4,
                status: false,
                message: "you can only manage banner for Extension owner ",
                payload: {}
            })
        }
    } catch (error) {
        res.status(500).send({
            code: 3,
            message: "Error occured while updating manage banner",
            payload: error
        })
    }
}

/**
 * CRUD FOR BUTTONS
 */

module.exports.createButton = async (req, res) => {
    console.log("create button req.body : ", req.body)
    console.log("req.user : ", req.user)
    const label = req.body.label
    const link = req.body.link
    const extensionId = String(req.user.user.extension._id)

    try {
        let createBtnLoad = await buttonModel.create({ label: label, link: link, is_deleted: false, extension_id: extensionId })
        // let extension = await extensionModel.findOne({_id: mongoose.Types.ObjectId(extensionId)})
        // let extButtonsArray = extension.buttons
        let updateExt = await extensionModel.update(
            { _id: mongoose.Types.ObjectId(extensionId) },
            {
                $push: {
                    "buttons": {
                        button_id: createBtnLoad._id
                    }
                }
            })
        console.log("updateExt : ", updateExt)
        return res.status(200).send({
            code: 0,
            message: "Success",
            data: createBtnLoad
        })

    } catch (e) {
        console.log("Error : createButton : ", e)
        return res.status(500).send({
            code: 0,
            message: "Error. Our servers are busy, please try after some time.",
            payload: e
        })
    }
}

module.exports.updateButton = async (req, res) => {
    try {
        console.log("update button req.body : ", req.body)
        console.log("req.user : ", req.user)
        const button = req.user.user.button
        console.log("button id : ", button._id)
        const label = String(req.body.label)
        const link = req.body.link

        const payload = await buttonModel.updateOne({
            _id: button._id
        }, {
            link: link && link.trim().length > 2 ? link : button.link,
            label: label && label.trim().length > 2 ? label : button.label
        })

        return res.status(200).send({
            code: 0,
            message: "Success",
            data: await buttonModel.findOne({ _id: button._id })
        })
    } catch (e) {
        console.log("Err updateButton : ", e)
        return res.status(500).send({
            code: 0,
            message: "Error. Our servers are busy, please try after some time..",
            payload: e
        })
    }
}

module.exports.deleteButton = async (req, res) => {
    try {
        console.log("delete button req.body : ", req.body)
        // console.log("req.user : ", req.user)
        const button = req.user.user.button
        let extension = req.user.user.extension
        const buttonId = String(button._id)
        console.log("button : ", button)
        const payload = await buttonModel.updateOne({
            _id: mongoose.Types.ObjectId(buttonId)
        }, {
            is_deleted: true
        })

        let extensionButtons = extension.buttons;
        let status = false;
        extensionButtons.filter(async (curButton, index, arr) => {
            if (String(curButton.button_id) == buttonId) {
                extensionButtons.splice(index, 1);
                status = true;
            }
        })
        if (status == false) {
            return res.status(500).send({
                code: 4,
                message: "This button is not included in your extension",
                payload: {}
            })
        }

        extension.buttons = extensionButtons;
        extension.save();
        return res.status(200).send({
            code: 0,
            message: "Button deleted successfully.",
            data: {}
        })
    } catch (e) {
        console.log("Err deleteButton : ", e)
        return res.status(500).send({
            code: 0,
            message: "Error. Our servers are busy, please try after some time..",
            payload: e
        })
    }
}

module.exports.fetchButtons = async (req, res) => {
    try {
        let limit = req.query.limit ? req.query.limit : 15;
        let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
        const owner_id = req.user.user.id;
        const extension_id = req.query.extension_id
        // console.log("fetch buttons req.body : ", req.body)
        // console.log("req.user : ", req.user)
        // const extensionId = String(req.user.user.extension._id)
        let dataQuery = [
            {
                $match :{
                    extension_owner_id:mongoose.Types.ObjectId(String(owner_id)),
                    is_active:true
                }
            },
            {
                $unwind :{
                    path : "$buttons",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup:{
                    from : "buttons",
                    localField : "buttons.button_id",
                    foreignField : "_id",
                    as : "button_info"
                }
            },
            {
                $unwind:{
                    path:"$button_info",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project:{
                    _id : "$button_info._id",
                    label : "$button_info.label",
                    link : "$button_info.link",
                    is_deleted : "$button_info.is_deleted",
                    createdAt :"$button_info.createdAt",
                    extension_id : "$_id",
                    extension_name : "$name"
                }
            },
            {
                $match:{
                    is_deleted : false
                }
            }
        ]
        if(extension_id){
            dataQuery.push(
                {
                    $match:{
                        extension_id : mongoose.Types.ObjectId(extension_id)
                    }
                }
            )
        }
        let buttonsLength = (await extensionModel.aggregate(dataQuery)).length;
        if(req.query.page && req.query.page != undefined && req.query.page != null && req.query.page != "undefined"){
            dataQuery = [...dataQuery,{"$skip": page },{ "$limit": limit }]
        }
        let buttons = await extensionModel.aggregate(dataQuery);
        console.log("buttons ",buttons);
        // if(buttons.length <= 0){
        //     return res.status(500).send({
        //         code: 3,
        //         message: "You dont have any useful links",
        //         payload: []
        //     })
        // }
        return res.status(200).send({
            code: 0,
            message: "Button fetched successfully.",
            data: buttons,
            totalData : buttonsLength
        })
    } catch (e) {
        console.log("Err fetchButton : ", e)
        return res.status(500).send({
            code: 0,
            message: "Error. Our servers are busy, please try after some time..",
            payload: e
        })
    }
}

module.exports.createBroadcast = async (req, res) => {
    try {
        let dateTime = req.body.dateTime;
        let content = req.body.content;
        let link = req.body.link;
        let label = req.body.label;
        let extension_id = req.body.extension_id;
        let getUser = await userModel.findOne({ _id: req.user.user.id });
        let extensionDetails = await extensionModel.findOne({ _id:extension_id,extension_owner_id: getUser._id });
        if (!extensionDetails) {
            return res.status(404).send({
                code: 1,
                message: "No extension found.",
                data: {}
            })
        }
        let broadcastDetails = extensionDetails.broadcast_details;
        broadcastDetails = {
            ...broadcastDetails,
            date_time: dateTime,
            content: content,
            label: label,
            link: link,
        }
        extensionDetails.broadcast_details = broadcastDetails;
        await extensionDetails.save();
        // let extensionUserDetails = 
        let extUsers = await extensionuserModel.find(
            {
                associated_extension_details: {
                    $elemMatch: { extension_owner_id: getUser._id, is_deleted: false }
                }
            });
        if (extUsers) {
            await extensionuserModel.updateMany(
                {
                    associated_extension_details: {
                        $elemMatch: { extension_owner_id: getUser._id, is_deleted: false }
                    }
                },
                { $set: { "associated_extension_details.$[].broadcast_status": true } }
            )
        }
        return res.status(200).send({
            code: 2,
            message: "Broadcast Created Successfully.",
            data: broadcastDetails
        })
    } catch (error) {
        console.log("Error in createBroadcast : ", error)
        return res.status(500).send({
            code: 0,
            message: "Error. Our servers are busy, please try after some time..",
            payload: {}
        })
    }
}

module.exports.fetchBroadcast = async (req, res) => {
    try {
        // let limit = req.query.limit ? req.query.limit : 15;
        // let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
        const extension_id = req.query.extension_id
        let getUser = await userModel.findOne({ _id: req.user.user.id });

        let dataQuery = [
            {
                $match:{
                    extension_owner_id: mongoose.Types.ObjectId(String(getUser._id)),
                    "broadcast_details.date_time":{
                        "$exists": true, 
                        "$ne": null 
                    },
                    "broadcast_details.content":{
                        "$exists": true, 
                        "$ne": null 
                    },
                    "broadcast_details.label":{
                        "$exists": true, 
                        "$ne": null 
                    },
                    "broadcast_details.link":{
                        "$exists": true, 
                        "$ne": null 
                    },
                }
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    broadcast_details : 1
                }
            }
        ]

        if(extension_id){
            dataQuery.push(
                {
                    $match:{
                        _id : mongoose.Types.ObjectId(extension_id)
                    }
                }
            )
        }

        // let broadcastDetailsLength = (await extensionModel.aggregate(dataQuery)).length;
        // if(req.query.page && req.query.page != undefined && req.query.page != null && req.query.page != "undefined"){
        //     dataQuery = [...dataQuery,{"$skip": page },{ "$limit": limit }];
        // }
        let broadcastDetails = await extensionModel.aggregate(dataQuery);

        if (!broadcastDetails) {
            return res.status(404).send({
                code: 1,
                message: "No extension found.",
                data: {}
            })
        }
        let finalResult = broadcastDetails.length > 0 ? broadcastDetails[0] : {};
        return res.status(200).send({
            code: 2,
            message: "Broadcast data fetched Successfully.",
            data: finalResult
        })
    } catch (error) {
        console.log("Error in fetch Broadcast : ", error)
        return res.status(500).send({
            code: 5,
            message: "Error. Our servers are busy, please try after some time..",
            payload: {}
        })
    }
}

module.exports.editBanner = async (req, res) => {

    try {

        console.log("CAME TO EDIT BANNER")

        const { link, banner_id, category_id } = req.body;
        const categoryDetails = req.categoryDetails;
        const owner_id = req.user.user.id;

        let image_link = null

        const findExtension = await extensionModel.findOne({global_banner:mongoose.Types.ObjectId(banner_id),is_active : true})
        
        if(!findExtension){
            return res.status(500).send({
                code: 3,
                message: "Extension not found to update Banner.",
                payload: {}
            })
        }
        if (req.file) {
            const fileContent = fs.readFileSync(req.file.path);
            let cur_category = (req.categoryDetails.name == "Global") ?
                req.categoryDetails.name :
                (req.categoryDetails.name + shortid.generate());
            let fileExtension = req.file.mimetype ? req.file.mimetype.replace("image/", '.') : ".png";
            let file_key = `bannerfiles/${owner_id}-${findExtension._id}-${cur_category}${fileExtension}`;
            image_link = await _helper.utility.common.uploadImageToBucket(fileContent, file_key)
            // console.log("Image link ",image_link);
            if (!image_link) {
                res.status(500).send({
                    code: 3,
                    message: err.message,
                    payload: {}
                })
                return;
            }

            await unlinkAsync(req.file.path);
        }

        let banner = await bannerModel.findOne({ _id: banner_id })

        if (!banner) {
            return res.status(500).send({
                code: 3,
                message: "Incorrect banner info.",
                payload: {}
            })
        }

        // let setObj = {}
        banner.image_link = image_link == null ? banner.image_link : image_link
        banner.link = link
        banner.is_deleted = false
        banner.is_active = true

        let updateBanner = await banner.save();
        if (!updateBanner) {
            res.status(500).send({
                code: 3,
                message: "Error while uploading banner",
                payload: {}
            })
            return;
        }
        res.status(200).send({
            code: 1,
            status: true,
            message: "Banner uploaded successfully",
            payload: updateBanner
        })

    } catch(e) {
        console.log("Error while editing banner in extensionOwner :: ", e)
        return res.status(500).send({
            code: 5,
            message: "Error. Our servers are busy, please try after some time..",
            payload: {}
        })
    }
}

// module.exports.fetchRemainExtension = async (req,res) =>{
//     try{
//         const owner_id = req.user.user.id;
//         const {scenario} = req.body;
//         let dataQuery = [
//             {
//                 $match : {
//                     extension_owner_id : mongoose.Types.ObjectId(String(owner_id)),
//                     is_active : true
//                 }
//             }
//         ]
//         if(scenario == "brodcast"){
//             dataQuery.push(
//                 {
//                     $match :{
//                         "broadcast_details.date_time" : null,
//                         "broadcast_details.content" : null,
//                         "broadcast_details.label" : null,
//                         "broadcast_details.link" : null,
//                     } 
//                 }
//             )
//         }
//         if(scenario == "banner"){
//             dataQuery.push(
//                 {
//                     $match :{
//                         "global_banner" : null,
//                     } 
//                 }
//             )
//         }
//         const remainExtension = await extensionModel.aggregate(dataQuery);
//         return res.status(200).send({
//             code: 1,
//             status: true,
//             message: "Remain Extension fetched successfully",
//             payload: remainExtension
//         })
//     }catch(e){
//         return res.status(500).send({
//             code: 5,
//             message: "Error. Our servers are busy, please try after some time..",
//             payload: {}
//         })
//     }
// }

module.exports.fetchBalance = async(req,res) =>{
    try{
        const extOwnerId = req.user.user.id;
        const fetchExtOwner = await userModel.findOne({_id:mongoose.Types.ObjectId(extOwnerId),user_type : 3,is_deleted : false},{_id:1,balance :1});
        if(!fetchExtOwner){
            return res.status(500).send({
                code: 3,
                message: "Error while fetching Balance",
                payload: 0
            })
        }
        return res.status(200).send({
            code: 1,
            status: true,
            message: "Fetch balance successfully",
            payload: fetchExtOwner.balance ? fetchExtOwner.balance : 0
        })
    }catch(e){
        return res.status(500).send({
            code: 5,
            message: "Error occur while fetching Balance.",
            payload: 0
        })
    }
}