
const extensionuserModel = require('../../../models/mongoose/extensionusers')
const extensionModel = require('../../../models/mongoose/extensions')
const _helper = require('../../../Helpers/helpers')
const jwt     = require('jsonwebtoken')
const mongoose = require("mongoose");
const bannerModel = require('../../../models/mongoose/banners')
const categoryModel = require('../../../models/mongoose/categories')
const userModel = require('../../../models/mongoose/users')
const usefulLinksModel = require('../../../models/mongoose/buttons');

module.exports.create = async (req,res) => {
    // res.send({body : req.body})
    try {
        let payload =  req.body
        payload.extension_owner_id = req.user.user.id;
        payload.admin_id = req.user.user.admin_id;
        let response = await _helper.utility.extensionUser.createExtensionUser(payload)
        console.log("response ",response);
            if(response.status == false){
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
        console.log({"usercontroller":error})
        res.status(500).send({
            code     : 3,
            message  : "Error occured while creating Extension user",
            payload  : error
        })
    }
}

module.exports.findAll = async (req,res) => {
    try {
        let limit = req.query.limit ? req.query.limit : 15;
        let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
        let extensionUserDetails;
        let extensionOwnerId = String(req.user.user.id)
        const extension_id = req.query.extension_id;
        let dataQuery = [
            {
                $match:{
                    "associated_extension_details.extension_owner_id" : mongoose.Types.ObjectId(extensionOwnerId),
                    "associated_extension_details.is_deleted" : false
                }
            },
            {
                $unwind :{
                    path : "$associated_extension_details",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match : {
                    "associated_extension_details.extension_owner_id" : mongoose.Types.ObjectId(extensionOwnerId),
                    "associated_extension_details.is_deleted" : false
                }
            },
            {
                $lookup:{
                    from:"extensions",
                    localField : "associated_extension_details.extension_id",
                    foreignField : "_id",
                    as : "extensionDetails"
                }
            },
            {
                $unwind:"$extensionDetails"
            }
        ]
        if(extension_id){
            dataQuery.push({
                $match:{
                    "extensionDetails._id":mongoose.Types.ObjectId(extension_id)
                }
            })
        }
        let extensionUserDetailsLength = (await extensionuserModel.aggregate(dataQuery)).length;
        if(req.query.page) {
            dataQuery = [...dataQuery,{ "$skip": page },{ "$limit": limit },{"$sort":{createdAt: -1}}]
            extensionUserDetails = await extensionuserModel.aggregate(dataQuery)
        } else {
            extensionUserDetails = await extensionuserModel.aggregate(dataQuery)
        }
        console.log("extensionUserDetails ",extensionUserDetails);

       res.status(200).send({
           code : 1,
           message : "Fetched all extension users",
           payload : extensionUserDetails,
           totalData : extensionUserDetailsLength
       })
    } catch (error) {
        console.log("Error while fetching the extension user list ::: ", error)
        res.status(500).send({
            code     : 3,
            message  : "Error occured while Login",
            payload  : error
        })
    }
}

module.exports.suspendExtensionUser = async (req,res) =>{
    try{
        let extension_owner_id = req.user.user.id;
        let extensionouser_id = req.body.extensionouser_id;
        const extension_id = req.body.extension_id;

        let response = await _helper.utility.extensionUser.manageExtensionUser(extension_id,extension_owner_id,extensionouser_id,'suspend')
            console.log("response ",response);
            if(response.status == false){
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
    }catch(err){
        res.status(500).send({
            code     : 3,
            message  : "Error occured while suspending Extension Owners",
            payload  : err
        })
    }
}
module.exports.unsuspendExtensionUser = async (req,res) =>{
    try{
        let extension_owner_id = req.user.user.id;
        let extensionouser_id = req.body.extensionouser_id;
        const extension_id = req.body.extension_id;
        let response = await _helper.utility.extensionUser.manageExtensionUser(extension_id,extension_owner_id,extensionouser_id,'unsuspend')
            if(response.status == false){
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
    }catch(err){
        res.status(500).send({
            code     : 3,
            message  : "Error occured while unsuspending Extension Owners",
            payload  : err
        })
    }
}

module.exports.deleteExtensionUser = async (req,res) =>{
    try{
        let extension_owner_id = req.user.user.id;
        let extensionouser_id = req.body.extensionouser_id;
        const extension_id = req.body.extension_id;
        let response = await _helper.utility.extensionUser.manageExtensionUser(extension_id,extension_owner_id,extensionouser_id,'delete')
            if(response.status == false){
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
    }catch(err){
        res.status(500).send({
            code     : 3,
            message  : "Error occured while deleting Extension Owners",
            payload  : err
        })
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * This function returns the video that end user needs to see
 * Video changes every week
 * In the case there is no more video they see the last video
 * In the case they do  not log in for a long time, it is there fault so we will be showing what video they are supposed to see actually.
 */
const fetchVideoCore = async(req, res) => {
    try {
        console.log("IN fetchVideo : ", req.user)
        const userId = req.user.user.id;
        const extId = req.user.user.extension_id;
        console.log("userId : ", userId)
        const extUser = await extensionuserModel.findOne(mongoose.Types.ObjectId(userId))

        if (!extUser) {
            return {
                message: "User does not exist.",
                status: false,
                data: {}
            }
        }

        console.log("Cam 1")
        const secondsInOneWeek = 60 * 60 * 24 * 7 * 1000;

        const firstLoginTime = (new Date(extUser.first_loggedin_time)).valueOf();

        const timeNow = Date.now()

        console.log("Cam 2 : ", firstLoginTime, timeNow, extUser.first_loggedin_time)
        const videos = await extensionModel.aggregate([
            {
                "$match" : {"_id" : mongoose.Types.ObjectId(extId)}
            }, {
                "$unwind": "$videos"
            }, {
                "$group": {"_id": {video_id: "$videos.video_id"}}
            }, {
                "$lookup": {
                    "from": "videos",
                    "localField": "_id.video_id",
                    "foreignField": "_id",
                    "as": "video"
                }
            }, {
                "$unwind": "$video"
            }, {
                "$project" : {
                    "_id" : 0,
                    "link" : "$video.link",
                    "createdAt" : "$video.createdAt",
                    "isDeleted" : "$video.is_deleted",
                    "bannerLink" : "$video.banner_link",
                    "enable_banner" : "$video.enable_banner",
                    "bannerAd" : "$video.banner_ad",
                    "title" : "$video.title",
                    "description" : "$video.description",
                }
            }, {
                "$match" : {"isDeleted" : false}
            }, {
                "$sort" : { "createdAt": 1 } 
            }
        ])
        console.log("videos : ", videos)
        let totalLength = videos.length
        const differenceInTime = timeNow - firstLoginTime
        console.log("differenceInTime : ", differenceInTime)
        let nthVideo = Math.floor(differenceInTime / secondsInOneWeek)

        if(nthVideo >= totalLength) {
            nthVideo = totalLength - 1
        } 
        console.log("nthVideo : ", nthVideo)
        const videoLink = videos[nthVideo]
        console.log("videoLink : ", videoLink)

        return {
            message: videoLink ? "Success." : "Nothing to show.",
            status: videoLink ? true : false,
            data: videoLink ? videoLink : null
        }
    } catch (e) {
        console.warn(e)
        return {
            message: "Some error occoured. Please try after a while.",
            status: false,
            data: {}
        }
    }
}

module.exports.fetchVideo = async (req, res) => {
    const dataFetched = await fetchVideoCore(req, res)
    return res.status(dataFetched.status ? 200 : 500).send(dataFetched)
}

module.exports.fetchBannerAdApi = async (req, res) => {

    // If manage banner is true for extension owner
    console.log("comming in fetchBannerAdApi")
    const extensionOwnerId = req.user.user.extension_owner_id;
    const extId = req.user.user.extension_id
    const extensionOwner = await userModel.findOne({_id: mongoose.Types.ObjectId(extensionOwnerId)})
    const globalCategory = await categoryModel.findOne({name : "Global"})

    if(!extensionOwner) {
        return res.status(500).send({
            status: false,
            message : "Extension owner not found.",
            data: {}
        })
    }

    if(extensionOwner.manage_banner) {
        
        const videoForUser = await fetchVideoCore(req, res)
        if(videoForUser.status && videoForUser.data && videoForUser.data.bannerAd && videoForUser.data.bannerAd.trim().length > 0 && videoForUser.data.enable_banner) {
            // If that video has any banner and ad links show that
            return res.status(200).send({
                status: true,
                message : "Success. Showing bannerAd from video.",
                data: {
                    bannerAd : videoForUser.data.bannerAd,
                    bannerLink : videoForUser.data.bannerLink
                }
            })
        } else {
            // Else check if that extension owner has any any Global banner ad and link or not 
            // check which 
            if(!globalCategory) {
                return res.status(500).send({
                    status: false,
                    message : "Error. Unable to fetch global category.",
                    data: {}
                })
            }
            const extension = await extensionModel.findOne({_id: mongoose.Types.ObjectId(extId), is_active: true})
            if(!extension) {
                return res.status(500).send({
                    status: false,
                    message : "Error. Unable to fetch extension.",
                    data: {}
                })
            }
            const globalBannerId = extension.global_banner;
            const banner = await bannerModel.findOne({
                _id:mongoose.Types.ObjectId(globalBannerId),
                owner_id: mongoose.Types.ObjectId(extensionOwnerId), 
                category_id : mongoose.Types.ObjectId(mongoose.Types.ObjectId(globalCategory._id)),
                is_active : true,
                is_deleted: false
            })
            console.log("banner :: ", banner)
            if(!banner) {
                // No global banner is set so nothing to display
                return res.status(404).send({
                    status: false,
                    message : "Nothing to display.",
                    data: {}
                })
            } else {
                return res.status(200).send({
                    status: true,
                    message : "Showing extension owner global banner and ad.",
                    data: {
                        bannerAd : banner.image_link,
                        bannerLink : banner.link,
                    }
                })
            }
        }   
    } else {
        const adminId = req.user.user.admin_id;
        console.log("comming here")
        // get category_id of ext
        // get admin_id
        // check in baner with that category_id and admin_id with is_active true
        const extension = await extensionModel.findOne({_id: mongoose.Types.ObjectId(extId), is_active: true})
        if(!extension) {
            return res.status(500).send({
                status: false,
                message : "Error. Unable to fetch extension.",
                data: {}
            })
        }

        const banner = await bannerModel.findOne({
            category_id: mongoose.Types.ObjectId(extension.category_id),
            owner_id : mongoose.Types.ObjectId(adminId),
            is_deleted : false,
            is_active : true
        })
        if(banner != null && banner != undefined) {
            return res.status(200).send({
                status: true,
                message : "Success. Showing baners from the same category of the extension.",
                data: {
                    bannerAd : banner.image_link,
                    bannerLink : banner.link
                }
            })
            
        } else {
            
            // else get the 'global' category_id
            // check in banner collection that which banner has that admin_id & category_id
            // show

            console.log("comming in else part")
            if(!globalCategory) {
                return res.status(500).send({
                    status: false,
                    message : "Error. Unable to fetch global category.",
                    data: {}
                })
            }

            console.log("globalCategoryId : ", globalCategory._id)
            console.log("adminId : ", adminId)
            const bannerNew = await bannerModel.findOne({
                category_id : mongoose.Types.ObjectId(globalCategory._id),
                owner_id : mongoose.Types.ObjectId(adminId),
                is_deleted : false,
                is_active : true
            })
            if(!bannerNew) {
                return res.status(404).send({
                    status: false,
                    message : "Nothing to display.",
                    data: {}
                })
            } else {
                return res.status(200).send({
                    status: true,
                    message : "Success.",
                    data: {
                        bannerAd : bannerNew.image_link,
                        bannerLink : bannerNew.link
                    }
                })
            }
        }
    }
}

module.exports.fetchUsefulLinks = async (req,res) =>{
    try{
        const extension_id = req.user.user.extension_id;
        let usefulsLinks = await usefulLinksModel.find({extension_id:extension_id,is_deleted:false})
        if(!usefulsLinks){
            res.status(500).send({
                code    : 3,
                message :"Error while fetching useful links",
                payload : error
            })
        }
        return res.status(200).send({
            code: 1,
            message: "Useful links fetched succesfully",
            payload: usefulsLinks
        })
    }catch(error){
         res.status(500).send({
            code    : 3,
            message :"Error while fetching useful links",
            payload : error
        })
    }
}