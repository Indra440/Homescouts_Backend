const webpush = require('web-push');
const defaultConfig = require("../../config/default.json");
const extensionuserModel = require('../../models/mongoose/extensionusers')
const extensionModel = require('../../models/mongoose/extensions')
const mongoose = require('../../database/mongo');

const fetchQueryResult = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			dateNow = (new Date()).toISOString()
			console.log('date now : ', dateNow)

			dataObj = await extensionuserModel.aggregate([{
				"$unwind": '$associated_extension_details'
			}, {
				"$group": {
					"_id": {
						"extension_id": "$associated_extension_details.extension_id",
						"broadcast_status": "$associated_extension_details.broadcast_status",
						"extension_user_id": "$_id",
						"subscription_object": "$associated_extension_details.subscription_object",
						"suspended_by" : "$associated_extension_details.suspended_by",
						"user_id" : "$_id"
					}
				}
			}, {
				"$lookup": {
					"from": "extensions",
					"localField": "_id.extension_id",
					"foreignField": "_id",
					"as": "extensions"
				}
			}, {
				$replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$extensions", 0] }, "$$ROOT"] } }
			}, {
				"$project": {
					"extensions": 0
				}
			}, {
				"$project": {
					"_id": 0,
					"broadcast_date_time": "$broadcast_details.date_time",
					"broadcast_content": "$broadcast_details.content",
					"broadcast_label": "$broadcast_details.label",
					"broadcast_link": "$broadcast_details.link",
					"broadcast_isActive": "$broadcast_details.is_active",
					"broadcast_isDeleted": "$broadcast_details.is_deleted",
					"extension_id": "$_id.extension_id",
					"broadcast_status": "$_id.broadcast_status",
					"extension_user_id": "$_id.extension_user_id",
					"subscription_object": "$_id.subscription_object",
					"suspended_by" : "$_id.suspended_by",
					"timestamp" : "$createdAt",
					"user_id" : "$_id.user_id",
					"user_email" : "$_id.user_email"
				}
			}, {
				"$match": {
					"$and": [
						{
							"broadcast_date_time": {
								"$lte": dateNow
							}
						}, {
							"broadcast_isActive": true
						}, {
							"broadcast_isDeleted": false
						}, {
							"broadcast_status": true
						}, {
							"subscription_object" : {
								"$exists" : true
							}
						}, {
							"suspended_by" : 0
						}
					]
				}
			}, {
				"$limit": 100
			}
			])
			resolve(dataObj)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports.notifyUser = async () => {

	let dataObj
	try {
		dataObj = await fetchQueryResult()
		console.log('dataObj : ', dataObj)
	} catch (e) {
		console.log("ERR in notify.js notifuUser : ", e)
	}

	// const updateMap = {}
	for (let i = 0; i < dataObj.length; i++) {
		
		try {
			const payload = JSON.stringify({
				title: dataObj[i].broadcast_label,
				// vibrate: [200, 100, 200, 100, 200, 100, 200],
				body: dataObj[i].broadcast_content + ' Link: ' + dataObj[i].broadcast_link, 
				// icon: "assets/48X48.png", 
				data : {
					time: (new Date(dataObj[i].timestamp)).getTime(),
					url : dataObj[i].broadcast_link,
					user_id : dataObj[i].user_id,
					user_email : dataObj[i].user_email,
					extension_id : dataObj[i].extension_id
				},
				requireInteraction: true
			})

			console.log('payload : ', payload)

			/**
			 * Setting up vapid keys
			 */
			await webpush.setVapidDetails(
				'mailto:work@tier5.us',
				defaultConfig.publicVapidKey,
				defaultConfig.privateVapidKey
			)

			await webpush.sendNotification(dataObj[i].subscription_object, payload).catch(err => console.error(`Error log from notifications : ${err}`))

			// let extensionUser = await extensionuserModel.findOne({ _id: mongoose.Types.ObjectId(String(dataObj[i].extension_user_id)) })

			// let newAssociatedExtensionDetails = extensionUser.associated_extension_details.map((el) => {
			// 	if (String(el.extension_id) == String(dataObj[i].extension_id)) {
			// 		// el.broadcast_status = false
			// 		// el.subscription_object = null
			// 		return el
			// 	}
			// 	return el
			// })
			// extensionUser.associated_extension_details = newAssociatedExtensionDetails
			// extensionUser.save()

			console.log('In notifyUser:', dataObj)
		} catch (e) {
			console.log("ERROR WHILE SENDING NOTIFICATION : ", dataObj[i])
			console.log(e)
		}
	}
}

const fetchVideoCoreScheduler = async(extId, userId) => {
    try {
        
        const extUser = await extensionuserModel.findOne(mongoose.Types.ObjectId(userId))
		
		if (!extUser) {
            return {
                message: "User does not exist.",
                status: false,
                data: {}
            }
        }

        
        const secondsInOneWeek = 60 * 60 * 24 * 7 * 1000;

        const firstLoginTime = (new Date(extUser.first_loggedin_time)).valueOf();

        const timeNow = Date.now()

		// console.log("Cam 2 : ", firstLoginTime, timeNow, extUser.first_loggedin_time)
		
		console.log("extId in core :: ", extId)

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
                    "url" : "$video.link",
                    "createdAt" : "$video.createdAt",
                    "isDeleted" : "$video.is_deleted",
                    "bannerLink" : "$video.banner_link",
                    "enable_banner" : "$video.enable_banner",
                    "bannerAd" : "$video.banner_ad",
					"title" : "$video.title",
					"video_id" : "$video._id",
                    "description" : "$video.description",
                }
            }, {
                "$match" : {"isDeleted" : false}
            }, {
                "$sort" : { "createdAt": 1 } 
            }
		])
		
		// console.log("videos : ", videos)
        let totalLength = videos.length
        const differenceInTime = timeNow - firstLoginTime
        // console.log("differenceInTime : ", differenceInTime)
        let nthVideo = Math.floor(differenceInTime / secondsInOneWeek)

        if(nthVideo >= totalLength) {
            nthVideo = totalLength - 1
        } 
        // console.log("nthVideo : ", nthVideo)
		const videoLink = videos[nthVideo]
		const videoDescription = videos[nthVideo]
        // console.log("videoLink : ", videoLink)

        return {
            message: videoLink ? "Success." : "Nothing to show.",
            status: videoLink ? true : false,
            data: {
				url : videoLink ? videoLink.url : null,
				title : videoLink ? videoLink.title : null,
				description : videoLink ? videoLink.description : null,
				videoId : videoLink ? videoLink.video_id : null,

			}
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

module.exports.notifyVideoUpdate = async () => {

	dataObj = await extensionuserModel.aggregate([{
		"$unwind": '$associated_extension_details'
	}, {
		"$group": {
			"_id": {
				"extension_id": "$associated_extension_details.extension_id",
				"last_video_notification_id" : "$associated_extension_details.last_video_notification_id",
				"extension_user_id": "$_id",
				"subscription_object": "$associated_extension_details.subscription_object",
				"suspended_by" : "$associated_extension_details.suspended_by",
				"user_id" : "$_id"
			}
		}
	}, {
		"$lookup": {
			"from": "extensions",
			"localField": "_id.extension_id",
			"foreignField": "_id",
			"as": "extensions"
		}
	}, {
		$replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$extensions", 0] }, "$$ROOT"] } }
	}, {
		"$project": {
			"extensions": 0
		}
	}, {
		"$project": {
			"_id": 0,
			"extension_id": "$_id.extension_id",
			"last_video_notification_id" : "$_id.last_video_notification_id",
			"extension_user_id": "$_id.extension_user_id",
			"subscription_object": "$_id.subscription_object",
			"suspended_by" : "$_id.suspended_by",
			"user_id" : "$_id.user_id",
			"user_email" : "$_id.user_email"
		}
	}, {
		"$match": {
			"$and": [
				 {
					"subscription_object" : {
						"$exists" : true
					}
				}, {
					"suspended_by" : 0
				}
			]
		}
	}, {
		"$limit": 100
	}
	])

	console.log("extensionUsers-- :: ", dataObj[0])

	for(let i = 0 ; i < dataObj.length ;) {

		const data = dataObj[i]

		// console.log("dataObj", i, data)

		const extId = String(data.extension_id)

		const extUserId = String(data.extension_user_id)

		var videoNotificationData = await fetchVideoCoreScheduler(extId, extUserId)
	
		console.log("videoNotificationData :: ", videoNotificationData)
		

		if(videoNotificationData.status == false) {
			i = i + 1
			continue
		} else if(String(videoNotificationData.data.videoId) == String(data.last_video_notification_id)) {
			i = i + 1
			continue
		}

		videoNotificationData.data.videoNotification = true
		videoNotificationData.data.extensionUserId = extUserId
		videoNotificationData.data.extensionId = extId

		try {
			const payload = JSON.stringify({
				title: videoNotificationData.data.title,
				body: 'Hey there is a new video to check : ' + videoNotificationData.data.url,
				data : videoNotificationData.data,
				requireInteraction: true
			})

			console.log('payload : ', payload)

			/**
			 * Setting up vapid keys
			 */
			await webpush.setVapidDetails(
				'mailto:work@tier5.us',
				defaultConfig.publicVapidKey,
				defaultConfig.privateVapidKey
			)

			await webpush.sendNotification(data.subscription_object, payload).catch(err => console.error(`Error log from notifications : ${err}`))

			console.log('In notifyVideoUpdate:', data)
			i = i + 1

		} catch (e) {
			console.log("ERROR WHILE SENDING NOTIFICATION : ", data)
			console.log(e)
			i = i + 1
		}
	}
}