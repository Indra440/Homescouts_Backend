
const _helper = require('../../../Helpers/helpers');

const simpleGit = require('simple-git');
const git = simpleGit();
const constants = require('../../../config/default.json')
const extensionsModel = require('../../../models/mongoose/extensions');
const videoModel = require('../../../models/mongoose/videos');
const { promisify } = require("util");
const shortid = require("shortid");
const mongoose = require("mongoose");

const util = require('util');
const exec = util.promisify(require('child_process').exec);
var mkdirp = require('mkdirp');
const fs = require("fs");
var zipFolder = require("zip-folder");
const { extensionUser, extensionOwner } = require('../../../Middlewares/API/api');
const unlinkAsync = promisify(fs.unlink);

const userModel = require('../../../models/mongoose/users');

const extensionUserModel = require('../../../models/mongoose/extensionusers');

module.exports.create = async (req, res) => {
    try {
        const { name, category_id, short_description, long_description,version,enable_signup,signup_link} = req.body;
        const noSpaceName = name.replace(/\s/g, "_")
        const admin_id = req.user.user.admin_id;
        const extension_owner_id = req.user.user.id;
        let extension_owner_details = req.cur_user;
        const small_icon_fileContent = fs.readFileSync(req.files.small_icon[0].path);
        let small_icon_key = `extensionfiles/${extension_owner_id}-${noSpaceName}-small_icon.png`;
        const small_icon_link = await _helper.utility.common.uploadImageToBucket(small_icon_fileContent, small_icon_key)
        if (!small_icon_link) {
            await _helper.utility.extension.remove_all_files_for_extension(req.files)
            return res.status(500).send({
                code: 3,
                message: "Error occur while uploading files",
                payload: {}
            });
        }
        const medium_icon_fileContent = fs.readFileSync(req.files.medium_icon[0].path);
        let medium_icon_key = `extensionfiles/${extension_owner_id}-${noSpaceName}-medium_icon.png`;
        const medium_icon_link = await _helper.utility.common.uploadImageToBucket(medium_icon_fileContent, medium_icon_key)
        if (!medium_icon_link) {
            await _helper.utility.extension.remove_all_files_for_extension(req.files)
            return res.status(500).send({
                code: 3,
                message: "Error occur while uploading files",
                payload: {}
            });
        }
        const large_icon_fileContent = fs.readFileSync(req.files.large_icon[0].path);
        let large_icon_key = `extensionfiles/${extension_owner_id}-${noSpaceName}-large_icon.png`;
        const large_icon_link = await _helper.utility.common.uploadImageToBucket(large_icon_fileContent, large_icon_key)
        if (!large_icon_link) {
            await _helper.utility.extension.remove_all_files_for_extension(req.files)
            return res.status(500).send({
                code: 3,
                message: "Error occur while uploading files",
                payload: {}
            });
        }
        const primary_logo_fileContent = fs.readFileSync(req.files.primary_logo[0].path);
        let primary_logo_key = `extensionfiles/${extension_owner_id}-${noSpaceName}-primary_logo.png`;
        const primary_logo_link = await _helper.utility.common.uploadImageToBucket(primary_logo_fileContent, primary_logo_key)
        if (!primary_logo_link) {
            await _helper.utility.extension.remove_all_files_for_extension(req.files)
            return res.status(500).send({
                code: 3,
                message: "Error occur while uploading files",
                payload: {}
            });
        }
        await _helper.utility.extension.remove_all_files_for_extension(req.files)
        const payload = {
            name: name,
            description: {
                short_description: short_description ? short_description : "",
                long_description: long_description ? long_description : "",
            },
            logo: {
                small_icon: small_icon_link,
                medium_icon: medium_icon_link,
                large_icon: large_icon_link,
                primary_logo: primary_logo_link
            },
            version:version,
            extension_owner_id: extension_owner_id,
            admin_id: admin_id,
            category_id: category_id,
            enable_signup: (enable_signup || (enable_signup != "")) ? enable_signup :false,
            signup_link : (signup_link || (enable_signup!="")) ? signup_link : null
        };
        extensionsModel.create(payload)
        .then(async (data, err) => {
            if (err) {
                return res.status(500).send({
                    code: 4,
                    message: "Error occured while creating Extension",
                    payload: error
                })
            }
            extension_owner_details.balance = Number(extension_owner_details.balance) - 1;
            await extension_owner_details.save();
            return res.status(200).send({
                code: 3,
                message: "Extension created successfully",
                payload: data
            })
        })
    } catch (error) {
        await _helper.utility.extension.remove_all_files_for_extension(req.files)
        res.status(500).send({
            code: 4,
            message: "Error occured while creating Extension",
            payload: error
        })
    }
}

module.exports.findAll = async (req, res) => {
    try {
        const extensionOwnerId = req.user.user.id;
        let limit = req.query.limit ? req.query.limit : 15;
        const page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
        let query = { "extension_owner_id": mongoose.Types.ObjectId(extensionOwnerId),is_active : true }
        let dataQuery = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_Deatils"
                }
            },
            {
                $unwind: {
                    path: "$category_Deatils",
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "extension_owner_id",
                    foreignField: "_id",
                    as: "owner_Deatils"
                }
            },
            {
                $unwind:{
                    path:"$owner_Deatils"
                }
            },
            {
                $project:{
                    _id:1,
                    name : 1,
                    description : 1,
                    logo : 1,
                    version : 1,
                    extension_owner_id : 1,
                    category_id : 1,
                    enable_signup : 1,
                    signup_link : 1,
                    global_banner : 1,
                    buttons : 1,
                    videos : 1,
                    broadcast_details : 1,
                    owner_balance : "$owner_Deatils.balance"
                }
            }
        ]
        let totalExtension = (await extensionsModel.aggregate(dataQuery)).length;
        console.log("totalExtension ",totalExtension);
        console.log("page is here ",typeof(req.query.page));
        if(req.query.page && req.query.page != undefined && req.query.page != null && req.query.page != "undefined"){
            dataQuery = [...dataQuery,{ "$skip": page },{ "$limit": limit }]
        }
        console.log("dataQuery for extensions ",dataQuery);        
        let finalExtensions = await extensionsModel.aggregate(dataQuery);
        console.log("finalExtensions ",finalExtensions);
        if(!finalExtensions || !totalExtension){
            return res.status(500).send({
                code: 4,
                message: "Error occured while fetching Extension",
                data:[] 
            })
        }
        res.status(200).send({
            status: true,
            data: finalExtensions,
            totalData : totalExtension
        })
    } catch (error) {
        console.log("Error is here ",error);
        return res.status(500).send({
            code: 5,
            message: "Error occured while fetching Extension",
            data:error
        })
    }
}

module.exports.findExtension = async (req, res) => {
    try {
        const extensionOwnerId = req.user.user.id;
        const extension_id = req.query.extension_id
        let query = { "extension_owner_id": mongoose.Types.ObjectId(extensionOwnerId), is_active : true }
        // let allExtensionDetails = await extensionsModel.find({ extension_owner_id: extensionOwnerId })
        const dataQuery = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_Deatils"
                }
            },
            {
                $unwind: {
                    path: "$category_Deatils",
                }
            },
            { $sort : { createdAt : -1 } }
        ]
        if(extension_id && extension_id != null && extension_id != undefined){
            dataQuery.push(
                {
                    $match:{
                        _id:mongoose.Types.ObjectId(extension_id)
                    }
                }
            )
        }
        const result = await extensionsModel.aggregate(dataQuery);
        if (!result) {
            return res.status(500).send({
                code: 4,
                message: "Error occured while fetching Extension",
                payload: err
            })
        }
        let finalResult = result.length > 0 ? result[0] : {};
        res.status(200).send({
            status: true,
            data: finalResult
        })
    } catch (error) {
        res.status(500).send({
            code: 4,
            message: "Error occured while fetching Extension",
            payload: error
        })
    }
}


    module.exports.updateSignupLink = async (req,res) =>{
        try{
            let extension_details = req.extension_details;
            const {enable_signup,signup_link} = req.body;
            extension_details.enable_signup = enable_signup;
            enable_signup ? extension_details.signup_link = signup_link : "";
            extension_details.save();
            res.status(200).send({
                code: 1,
                message: "Signup link updated successfully",
                payload: extension_details
            })
        }catch(err){
            res.status(500).send({
                code: 4,
                message: "Error occured while fetching Signup link",
                payload: err
            })
        }
    }

module.exports.updateLogo = async (req,res) =>{
    try{
        let owner_id = req.user.user.id;
        let extension_details = req.extension_details;
        let name = extension_details.name;
        const noSpaceName = name.replace(/\s/g, "_")
        let updatedBannerLink;
        if (req.file) {
            const fileContent = fs.readFileSync(req.file.path);
            let primary_logo_key = `extensionfiles/${owner_id}-${Math.random().toString(36).substring(7)}-${noSpaceName}-primary_logo.png`;
            updatedBannerLink = await _helper.utility.common.uploadImageToBucket(fileContent, primary_logo_key)
        }
        if(!updatedBannerLink){
            res.status(500).send({
                code: 4,
                message: "Error occured while updating the logo",
                payload: {}
            })
        }
        req.file ? await unlinkAsync(req.file.path) : "";
        extension_details.logo.primary_logo = updatedBannerLink;
        extension_details.save();
        res.status(200).send({
            code: 3,
            message: "Logo updated successfully",
            payload: extension_details
        })
    }catch(err){
        req.file ? await unlinkAsync(req.file.path) : "";
        res.status(500).send({
            code: 4,
            message: "Error occured while uploading video",
            payload: err
        })
    }
}

module.exports.updateVersion = async (req,res) =>{
    try{
        let extension_deatails = req.extension_details;
        extension_deatails.version = req.body.extensionVersion;
        extension_deatails.save();
        res.status(200).send({
            code: 3,
            message: "version updated successfully",
            payload: extension_deatails
        })
    }catch(err){
        res.status(500).send({
            code: 4,
            message: "Error occured while updating version",
            payload: err
        })
    }
}

module.exports.uploadvideo = async (req, res) => {
    try {
        const extensionOwnerId = req.user.user.id;
        const extension_id = req.extension_id;
        const { video_title, video_link, video_description,banner_link,delay_time} = req.body;
        var bannerAdLink;
        const video_id = extension_id + shortid.generate();
        if (req.file) {
            const fileContent = fs.readFileSync(req.file.path);
            let fileExtension = req.file.mimetype ? req.file.mimetype.replace("image/", '.') : ".png";
            let key = `videobannerfiles/${extensionOwnerId}-${video_id}${fileExtension}`;
            bannerAdLink = await _helper.utility.common.uploadImageToBucket(fileContent, key)
        }
        let payload = {
            title: video_title,
            link: video_link,
            description: video_description,
        }
        if (req.body.enable_banner) {
            payload.enable_banner = req.body.enable_banner
            payload.banner_ad = bannerAdLink;
            payload.banner_link = banner_link;
        }
        delay_time ? payload.delay_time = delay_time : "";
        req.file ? await unlinkAsync(req.file.path) : "";
        videoModel.create(payload)
            .then((data, err) => {
                if (err) {
                    res.status(500).send({
                        code: 4,
                        message: "Error occured while uploading video",
                        payload: err
                    })
                } else {
                    let videoPayload = {
                        video_id: data._id
                    }
                    extensionsModel.update(
                        { _id: extension_id },
                        { $push: { "videos": videoPayload } }, (err, result) => {
                            if (err) {
                                res.status(500).send({
                                    code: 4,
                                    message: "Error occured while uploading video",
                                    payload: err
                                })
                            }
                            res.status(200).send({
                                code: 3,
                                message: "Video uploaded successfully",
                                payload: result
                            })
                        })
                }
            })
    } catch (error) {
        req.file ? await unlinkAsync(req.file.path) : "";
        res.status(500).send({
            code: 4,
            message: "Error occured while uploading video",
            payload: error
        })
    }
}

    module.exports.updatedvideo = async (req,res) => {
        try{
            const extensionOwnerId = req.user.user.id;
            const extension_id = req.extension_id;
            const { video_id,video_title, video_link, video_description,banner_link } = req.body;
            var bannerAdLink ="";
            let videoDetails = await videoModel.findOne({_id:video_id,is_deleted:false})
            if(!videoDetails){
                res.status(500).send({
                    code: 4,
                    message: "Video is not existed or already deleted",
                    payload: {}
                })
            }
            if (req.file) {
                const video_id = extension_id + shortid.generate();
                let cur_video_banner = videoDetails.banner_ad ? videoDetails.banner_ad : "";
                let cur_video_banner_id = (cur_video_banner == "") ? 
                `/${extensionOwnerId}-${video_id}.png` : cur_video_banner.split("videobannerfiles")[1]
                const fileContent = fs.readFileSync(req.file.path);
                let key = `videobannerfiles`+ cur_video_banner_id;
                bannerAdLink = await _helper.utility.common.uploadImageToBucket(fileContent, key)
            }
            videoDetails.title = video_title;
            videoDetails.link = video_link;
            videoDetails.description = video_description;
            videoDetails.enable_banner = req.body.enable_banner;
            if(req.body.enable_banner) {
                videoDetails.banner_ad = (bannerAdLink == "") ? videoDetails.banner_ad : bannerAdLink;
                banner_link ? videoDetails.banner_link = banner_link : "";
            }
            req.file ? await unlinkAsync(req.file.path) : "";
            videoDetails.save();
            res.status(200).send({
                code: 3,
                message: "Video updated successfully",
                payload: videoDetails
            })
        }catch(err){
            req.file ? await unlinkAsync(req.file.path) : "";
            res.status(500).send({
                code: 4,
                message: "Error occured while updating video",
                payload: err
            })
        }
    }

    module.exports.listVideo = async (req,res) => {
        try{
            let limit = req.query.limit ? req.query.limit : 15;
            let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
            const owner_id = req.user.user.id;
            const extension_id = req.query.extension_id;
            // extension_deatails = req.extension_details;
            // let videos = extension_deatails.videos;
            let dataQuery = [
                {
                    $match :{
                        extension_owner_id:mongoose.Types.ObjectId(String(owner_id)),
                        is_active:true
                    }
                },
                {
                    $unwind :{
                        path : "$videos",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $lookup:{
                        from : "videos",
                        localField : "videos.video_id",
                        foreignField : "_id",
                        as : "video_info"
                    }
                },
                {
                    $unwind:{
                        path:"$video_info",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $project:{
                        _id : "$video_info._id",
                        title : "$video_info.title",
                        link : "$video_info.link",
                        description : "$video_info.description",
                        enable_banner : "$video_info.enable_banner",
                        banner_ad : "$video_info.banner_ad",
                        banner_link : "$video_info.banner_link",
                        is_deleted : "$video_info.is_deleted",
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
                dataQuery.push({
                    $match:{
                        extension_id : mongoose.Types.ObjectId(extension_id)
                    }
                })
            }
            let totalVideos = (await extensionsModel.aggregate(dataQuery)).length;
            if(req.query.page && req.query.page != undefined && req.query.page != null && req.query.page != "undefined"){
                dataQuery = [...dataQuery,{"$skip": page },{ "$limit": limit }]
            }
            let total_videos = await extensionsModel.aggregate(dataQuery);
            if(total_videos.length <= 0){
                return res.status(500).send({
                    code: 3,
                    message: "You dont have any videos",
                    payload: []
                })
            }
            res.status(200).send({
                code: 3,
                message: "Video fetched successfully",
                payload: total_videos,
                totalData: totalVideos
            })
        }catch(err){
            res.status(500).send({
                code: 4,
                message: "Error occured while fetching video",
                payload: err
            })
        }
    }

    module.exports.deleteVideo = async (req,res) => {
        try{
            let video_id = req.body.video_id;
            const extension_id = req.body.extension_id;
            const owner_id = req.user.user.id;
            const extension = await extensionsModel.findOne({_id:extension_id, extension_owner_id:owner_id,is_active:true})
            if(!extension || extension.length <=0){
                res.status(500).send({
                    code: 4,
                    message: "You dont have any active extension",
                    payload: {}
                })
            }
            let video_details = await videoModel.findOne({_id: video_id,is_deleted:false})
            if(!video_details){
                res.status(500).send({
                    code: 4,
                    message: "Video is not existed or already deleted",
                    payload: {}
                })
            }
            let extension_videos = extension.videos;
            let status = false;
            extension_videos.filter( async (cur_video,index,arr) =>{
                if(cur_video.video_id == video_id){
                    extension_videos.splice(index,1);
                    status = true;
                }
            })
            if(status == false){
                res.status(500).send({
                    code: 4,
                    message: "This video is not included in your extension",
                    payload: {}
                })
            }
            extension.videos = extension_videos;
            extension.save();
            video_details.is_deleted = true;
            video_details.save();
            res.status(200).send({
                code: 4,
                message: "Video deleted successfully",
                payload: {}
            })
        }catch(error){
            console.log("Error is here ",error);
            res.status(500).send({
                code: 4,
                message: "Error occured while deleting video",
                payload: error
            })
        }
    }

const getShortName = (name) => {

    let x = name.split(" ")
    let y = name.split("-")
    let z = name.split("_")
    let str = ""
    if(x.length > 0) {
        for(let i = 0 ; i < x.length ; i ++) {
            str += x[i].charAt(0)
        }
    } else if(y.length > 0) {
        for(let i = 0 ; i < y.length ; i ++) {
            str += y[i].charAt(0)
        }
    } else if(z.length > 0) {
        for(let i = 0 ; i < z.length ; i ++) {
            str += z[i].charAt(0)
        }
    }
    str = str.toUpperCase()
    console.log("Extension abbreviation : ", str)
    if(str.length <= 1) {
        str = name.charAt(0) + name.charAt(1)
        str = str.toUpperCase()
    }
    return str
}

// This function returns a downloadable link
module.exports.downloadExtensionApi = async (req, res) => {
    try {
        console.log("coming here in downloadExtensionApi")
        const datestr = Date.now()
        const gitpath = 'public/build/static/uploads';
        const extId = req.body.id;
        console.log("Id got : ", req.body)
        const ext = await extensionsModel.findOne(mongoose.Types.ObjectId(String(extId)));
        console.log("ext : ", ext)
        if (!ext) {
            return res.status(200).send({
                status: false,
                data: {
                    extName: "error1.zip"
                }
            })
        }
        console.log("Extension found : ", ext)
        console.log()
        console.log()
        const extNameOriginal = ext.name
        const extName = ext.name.replace(/\s/g, "_")
        mkdirp.sync(gitpath)
        let path = process.cwd()
        console.log("current path : ", (path + '/' + gitpath))
        const projectFolder = constants.repoName + '-' + datestr

        // To setUp publicVapidKey
        // To setup notificationUrl in src/Config/Env.js

        let string = 'cd ' + (path + '/' + gitpath)
            + ` && mkdir ${projectFolder} && cd ${projectFolder}`
            + ` && git clone --branch ${constants.extensionBranch} ${constants.repo} . `
            // + ' && npm i '
            // + ' && npm run build '
            // + ` && mv dist ../${datestr}-${extName} && cd ../ && rm -rf ${projectFolder}`
            // + ` && cp ${datestr}-${extName}/js/worker.js ${datestr}-${extName}/worker.js `
            
        console.log("1st command to execute : ", string)

        const { stdout, stderr } = await exec(string)
        
        
        let shortName = getShortName(extName)

        console.log('stdout : ', stdout)
        console.log('stderr : ', stderr)

        // Changing the manifest
        console.log('reading from manifest : ' + (gitpath + `/${projectFolder}/public/manifest.json`))
        var data = fs.readFileSync(
            (gitpath + `/${projectFolder}/public/manifest.json`),
            "utf-8"
        );
        let newData = JSON.parse(data);
        newData.name = extNameOriginal;
        newData.description = ext.description.short_description;
        newData.browser_action.default_title = extNameOriginal;
        newData.short_name = shortName
        if (ext.logo.small_icon != null && ext.logo.small_icon.trim().length > 0) {
            const arr16 = ext.logo.small_icon.split('/').reverse()
            const dataBody16 = await _helper.utility.common.downloadImageFromBucket(`${arr16[1]}/${arr16[0]}`, `${gitpath}/`)
            fs.writeFileSync(`${gitpath}/${projectFolder}/public/assets/${arr16[0]}`, dataBody16)
            newData.icons["16"] = `assets/${arr16[0]}`
        }
        if (ext.logo.medium_icon != null && ext.logo.medium_icon.trim().length > 0) {
            const arr48 = ext.logo.medium_icon.split('/').reverse()
            const dataBody48 = await _helper.utility.common.downloadImageFromBucket(`${arr48[1]}/${arr48[0]}`, `${gitpath}/`)
            fs.writeFileSync(`${gitpath}/${projectFolder}/public/assets/${arr48[0]}`, dataBody48)
            newData.icons["48"] = `assets/${arr48[0]}`
        }
        if (ext.logo.large_icon != null && ext.logo.large_icon.trim().length > 0) {
            const arr128 = ext.logo.large_icon.split('/').reverse()
            const dataBody128 = await _helper.utility.common.downloadImageFromBucket(`${arr128[1]}/${arr128[0]}`, `${gitpath}/`)
            fs.writeFileSync(`${gitpath}/${projectFolder}/public/assets/${arr128[0]}`, dataBody128)
            newData.icons["128"] = `assets/${arr128[0]}`
        }

        const newManifestTxt = JSON.stringify(newData, null, " ");
        fs.writeFileSync(
            (gitpath + `/${projectFolder}/public/manifest.json`),
            newManifestTxt,
            { mode: 0o755 }
        );
        console.log('writing to manifest complete -- ')

        var yceSettingsData = fs.readFileSync(
            (gitpath + `/${projectFolder}/public/yceSettings.json`),
            "utf-8"
        );
        let yceSettingsDataParsed = JSON.parse(yceSettingsData)
        yceSettingsDataParsed.ExtID = extId
        yceSettingsDataParsed.AppName = extNameOriginal
        yceSettingsDataParsed.publicVapidKey = constants.publicVapidKey
        yceSettingsDataParsed.notificationUrl = (req.protocol+"://"+req.headers.host+'/api/subscribe-notification')
        yceSettingsDataParsed.baseUrl = (req.protocol+"://"+req.headers.host+'/api/')

        // yceSettingsDataParsed.logo = ext.logo.primary_logo
        // yceSettingsDataParsed.logoHamburger = ext.logo.primary_logo
        let yceTxt = JSON.stringify(yceSettingsDataParsed, null, " ")
        fs.writeFileSync(
            (gitpath + `/${projectFolder}/public/yceSettings.json`),
            yceTxt,
            { mode: 0o755 }
        );

        string = 'cd ' + (path + '/' + gitpath + '/' + projectFolder)
            // + ` && mkdir ${projectFolder} && cd ${projectFolder}`
            // + ` && git clone --branch ${constants.extensionBranch} ${constants.repo} . `
                + ' && npm i '
                + ' && npm run build '
                + ` && mv dist ../${datestr}-${extName} && cd ../ && rm -rf ${projectFolder}`
                + ` && cp ${datestr}-${extName}/js/worker.js ${datestr}-${extName}/worker.js `
            
        console.log("2nd command to execute : ", string)

        const { stdout1, stderr1 } = await exec(string)
        console.log('stdout1 : ', stdout1)
        console.log('stderr1 : ', stderr1)

        // string = `zip ${(path + '/' + gitpath)}/${datestr}-${extName}.zip ${(path + '/' + gitpath)}/${datestr}-${extName}`
        // const { stdout, stderr } = await exec(string)

        await zipFolder(
            (gitpath + `/${datestr}-${extName}`),
            (gitpath + `/${datestr}-${extName}.zip`),
            async function (err) {
                setTimeout(async () => {
                    // fs.rmdirSync(`${path}/${gitpath}/${datestr}-${extName}.zip` , { recursive: true });
                    // fs.rmdirSync(`${path}/${gitpath}/${datestr}-${extName}` , { recursive: true });

                    let string = `rm -rf ${path}/${gitpath}/${datestr}-${extName} && rm -rf ${path}/${gitpath}/${datestr}-${extName}.zip`
                    const { stdout, stderr } = await exec(string)
                    console.log("LAST STDOUT : ", stdout)
                    console.log("LAST STDERR : ", stderr)
                }, 20 * 1000);
                return res.status(200).send({
                    status: err ? false : true,
                    data: {
                        extName: err ? "error2.zip" : `${datestr}-${extName}.zip`
                    }
                })
            }
        )
    } catch (e) {
        console.log("Err : ", e)
        return res.status(200).send({
            status: false,
            data: {
                extName: "error3.zip"
            }
        })
    }
}



