
const userModel = require('../../../models/mongoose/users')
const _helper = require('../../../Helpers/helpers')
const fs = require("fs");
const shortid = require("shortid");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const mongoose = require("mongoose");
const bannerModel = require('../../../models/mongoose/banners');
const extensionModel = require('../../../models/mongoose/extensions');
const categoryModel = require('../../../models/mongoose/categories');
const extensionuserModel = require('../../../models/mongoose/extensionusers');

module.exports.create = async (req, res) => {
	try {
		const payload = req.body
		let response = await _helper.utility.admin.createAdmin(payload)
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
			message: "Error occured while creating Admin",
			payload: error
		})
	}
}




module.exports.dashboardStats = async (req, res) => {
	try {
		let activeAdmins = await userModel.find({ is_deleted: false, suspended_by: 0, user_type: 2 }).count()
		let inActiveAdmins = await userModel.find({ $and: [{ is_deleted: false }, { suspended_by: { $ne: 0 }, user_type: 2 }] }).count()

		let activeExtensions = await extensionModel.find({ is_active: true }).count()
		let inActiveExtensions = await extensionModel.find({ is_active: false }).count()

		let activeExtensionOwners = await userModel.find({ is_deleted: false, suspended_by: 0, user_type: 3 }).count()
		let inActiveExtensionOwners = await userModel.find({ $and: [{ is_deleted: false }, { suspended_by: { $ne: 0 }, user_type: 3 }] }).count()

		let activeExtensionUsers = await extensionuserModel.find({ "associated_extension_details.is_deleted": false, "associated_extension_details.suspended_by": 0 }).count()
		let inActiveExtensionUsers = await extensionuserModel.find({ $or: [{ "associated_extension_details.is_deleted": true }, { "associated_extension_details.suspended_by": { $ne: 0 } }] }).count()

		let payload = {
			activeAdmins,
			inActiveAdmins,
			activeExtensionOwners,
			inActiveExtensionOwners,
			activeExtensions,
			inActiveExtensions,
			activeExtensionUsers,
			inActiveExtensionUsers
		}

		res.status(200).send({
			code: 1,
			status: true,
			message: "successfully fetched all dashboard stats",
			payload: payload
		})
	} catch (error) {
		res.status(500).send({
			code: 3,
			message: "Error occured while fetching all dashboard stats",
			payload: error
		})
	}
}


module.exports.findAll = async (req, res) => {
	try {
		let limit = req.query.limit ? req.query.limit : 15;
		let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
		var admins;
		if(req.query.page) {
			admins = await userModel.find({ is_deleted: false, user_type: 2 },{},{ skip: page, limit: limit }).sort({createdAt: -1});
		} else {
			admins = await userModel.find({ is_deleted: false, user_type: 2 });
		}
		var totalData = await userModel.find({ is_deleted: false, user_type: 2 }).countDocuments();
		for (let i = 0; i < admins.length; i++) {
			let total_ceo = await userModel.find({ associated_admin_id: admins[i]._id, user_type: 3, is_deleted: false }).count()
			admins[i].set('total_ceo_number', total_ceo, { strict: false });
		}
		res.status(200).send({
			code: 1,
			status: true,
			message: "successfully fetched all Admins",
			totalData: totalData,
			payload: admins
		})
	} catch (error) {
		res.status(500).send({
			code: 3,
			message: "Error occured while fetching all Admins",
			payload: error
		})
	}
}

module.exports.suspendAdmin = async (req, res) => {
	try {
		let admin_id = req.body.admin_id;
		let adminDetails = req.adminDetails;
		let response = await _helper.utility.admin.manageAdminProcess(admin_id, adminDetails, 'suspend')
		if (response.status == false) {
			return res.status(500).send({
				code: 4,
				message: "Error while suspending admin",
				payload: response.payload
			})
		}
		return res.status(200).send({
			code: 1,
			message: "Admin suspended successfully",
			payload: response.payload
		})
	} catch (err) {
		return res.status(500).send({
			code: 4,
			message: "Error while suspending admin",
			payload: err
		})
	}
}

module.exports.unsuspendAdmin = async (req, res) => {
	try {
		let admin_id = req.body.admin_id;
		let adminDetails = req.adminDetails;
		let response = await _helper.utility.admin.manageAdminProcess(admin_id, adminDetails, 'unsuspend')
		if (response.status == false) {
			return res.status(500).send({
				code: 4,
				message: "Error while unsuspending admin",
				payload: response.payload
			})
		}
		return res.status(200).send({
			code: 1,
			message: "Admin unsuspended successfully",
			payload: response.payload
		})
	} catch (err) {
		return res.status(500).send({
			code: 4,
			message: "Error while unsuspending admin",
			payload: err
		})
	}
}

module.exports.deleteAdmin = async (req, res) => {
	try {
		let admin_id = req.body.admin_id;
		let adminDetails = req.adminDetails;
		let response = await _helper.utility.admin.manageAdminProcess(admin_id, adminDetails, 'delete')
		if (response.status == false) {
			return res.status(500).send({
				code: 4,
				message: "Error while deleting admin",
				payload: response.payload
			})
		}
		return res.status(200).send({
			code: 1,
			message: "Admin deleted successfully",
			payload: response.payload
		})
	} catch (err) {
		return res.status(500).send({
			code: 4,
			message: "Error while deleting admin",
			payload: err
		})
	}
}

module.exports.updateBalance = async (req, res) => {
	try {
		const { admin_id, balance } = req.body
		if(balance < 0 || balance == "-0"){
            res.status(500).send({
				code: 4,
				message: "Enter a valid balance",
				payload: {}
			})
        }else{
			userModel.updateOne(
				{ _id: admin_id },
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

module.exports.uploadBanner = async (req, res) => {
	try {
		const {link} = req.body;
		console.log("link : ", link)
		const categoryDetails = req.categoryDetails;
		const extensionDetails = req.extensionDetails;
		const category_id = categoryDetails._id;
		const owner_id = req.user.user.id;
		const fileContent = fs.readFileSync(req.file.path);
		let cur_category = (req.categoryDetails.name == "Global") ?
			req.categoryDetails.name :
			(req.categoryDetails.name + shortid.generate());
		let fileExtension = req.file.mimetype ? req.file.mimetype.replace("image/", '.') : ".png";
		let file_key = `bannerfiles/${owner_id}-${cur_category}${fileExtension}`;
		const image_link = await _helper.utility.common.uploadImageToBucket(fileContent, file_key)
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
		fetchBanner(owner_id, category_id).then(result => {
			if (result && (result.length > 0) && (categoryDetails.name == "Global")&& (!extensionDetails || extensionDetails.global_banner != null)) {
				bannerModel.updateOne({ owner_id: owner_id, category_id: category_id },
					{ $set: { image_link: image_link, link: link, is_deleted: false, is_active: true } },
					(err, result) => {
						if (err) {
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
							payload: result
						})
					})
			} else if (result) {
				let payload = {
					image_link: image_link,
					link: link,
					owner_id: owner_id,
					category_id: category_id
				}
				if (result && (result.length > 0) && (categoryDetails.name != "Global")) {
					let flag = true;
					result.map(banner => {
						if (banner.is_active == true) {
							flag = false;
						}
					});
					payload.is_active = flag;
				}
				bannerModel.create(payload).then(async (data, error) => {
					if (error) {
						res.status(500).send({
							code: 3,
							message: "Error while uploading banner",
							payload: {}
						})
						return;
					}
					if(extensionDetails && extensionDetails != null && extensionDetails != undefined){
						extensionDetails.global_banner = data._id;
						await extensionDetails.save();
					}
					res.status(200).send({
						code: 1,
						status: true,
						message: "Banner uploaded successfully",
						payload: {}
					})
				})
			} else {
				res.status(500).send({
					code: 3,
					message: "Error while uploading banner",
					payload: {}
				})
			}
		})
	} catch (error) {
		console.log("err while uploading banner :: ", error)
		res.status(500).send({
			code: 3,
			message: "Error occured while uploading banner",
			payload: error
		})
	}
}

module.exports.deleteBanner = async (req, res) => {
	try {
		let owner_id = req.user.user.id;
		let banner_id = req.body.banner_id;
		let getBanner = await bannerModel.findOne({ _id: banner_id, owner_id: owner_id, is_deleted: false });
		if (getBanner) {
			getBanner.is_deleted = true;
			await getBanner.save();
			res.status(200).send({
				code: 1,
				message: "Banner deleted successfully",
				payload: {}
			})
		} else {
			res.status(404).send({
				code: 4,
				message: "Banner not found",
				payload: {}
			})
		}
	} catch (error) {
		console.log('Error in deleting the banner:', error);
		res.status(500).send({
			code: 5,
			message: "Error occured deleting banner",
			payload: {}
		})
	}
}

module.exports.toggleBanner = async (req, res) => {
	try {
		let owner_id = req.user.user.id;
		let banner_details = req.banner_details;
		console.log("Banner details ", banner_details);
		let setTrue = true;
		let setFalse = false;
		let checkForAlreadyActive = false;
		if (banner_details.is_active === true)
			checkForAlreadyActive = true;

		if(req.user.user.user_type != 3){
			let bannersForCategory = await bannerModel.find({ owner_id: owner_id, category_id: banner_details.category_id })
			console.log("bannersForCategory ", bannersForCategory);
			if (!bannersForCategory) {
				res.status(500).send({
					code: 3,
					message: "Error occured while activate banner",
					payload: {}
				})
			}
			bannersForCategory.map(async (cur_banner) => {
				if (cur_banner.is_active == true) {
					bannerModel.updateOne(
						{ _id: cur_banner._id },
						{ $set: { is_active: setFalse } },
						(err, result) => {
							if (err) {
								res.status(500).send({
									code: 3,
									message: "Error occured while activate banner",
									payload: err
								})
							}
					})
				}
			})
		}
			
		banner_details.is_active = checkForAlreadyActive ? setFalse : setTrue;
		banner_details.save();
		res.status(200).send({
			code: 1,
			message: `Banner ${checkForAlreadyActive ? 'deactivated ' : 'activated '}  successfully`,
			payload: banner_details
		})
	} catch (err) {
		res.status(500).send({
			code: 3,
			message: "Error occured while updating banner status",
			payload: err
		})
	}
}

//dev-portal.yourchromeextension.com and dev-api.yourchromeextension.com
async function fetchBanner(owner_id, category_id) {
	try {
		let bannerDetails = await bannerModel.find({ owner_id: owner_id, category_id: category_id });
		return bannerDetails;
	} catch (error) {
		return error
	}
}


module.exports.fetchAllCategory = async (req, res) => {
	try {
		let admins = await categoryModel.find({ is_active: true })
		res.status(200).send({
			code: 1,
			status: true,
			message: "successfully fetched all category",
			payload: admins
		})
	} catch (error) {
		res.status(500).send({
			code: 3,
			message: "Error occured while fetching all category",
			payload: error
		})
	}
}

module.exports.fetchAllBanner = async (req, res) => {
	try {
		let limit = req.query.limit ? req.query.limit : 15;
        let page = req.query.page ? (parseInt(req.query.page)-1)*limit : 0*limit;
		const admin_id = req.user.user.id;
		let query = { "owner_id": mongoose.Types.ObjectId(admin_id), "is_deleted": false }
		let category_id = req.body.category_id;
		let extension_id = req.query.extension_id;
		if (category_id) {
			query.category_id = mongoose.Types.ObjectId(category_id);
		}

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
					from: "extensions",
					localField: "_id",
					foreignField: "global_banner",
					as: "extension_details"
				}
			},
			{
				$unwind: {
					path: "$extension_details",
					preserveNullAndEmptyArrays : true
				}
			}			
		]
		if(extension_id){
			dataQuery.push(
				{
					$match:{
						"extension_details._id":mongoose.Types.ObjectId(extension_id)
					}
				}
			)
		}
		const totalData = (await bannerModel.aggregate(dataQuery)).length;
		if(req.query.page ){
			dataQuery.push({ "$skip": 1 * page * limit },{ "$limit": limit })
		}
		const result = await bannerModel.aggregate(dataQuery)
		if (!result) {
			return res.status(500).send({
				code: 3,
				message: "Error occured while fetching all Banner",
				payload: err
			})
		} else {
			res.status(200).send({
				code: 1,
				status: true,
				message: "Banner fetched successfully",
				payload: result,
				totalData: totalData
			})
		}
	} catch (error) {
		res.status(500).send({
			code: 3,
			message: "Error occured while fetching all category",
			payload: error
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

		let cur_category = (req.categoryDetails.name == "Global") ?
			req.categoryDetails.name :
			(req.categoryDetails.name + shortid.generate());

		if(req.file) {
			console.log("GOING TO FILE UPLOAD")
			const fileContent = fs.readFileSync(req.file.path);
			let fileExtension = req.file.mimetype ? req.file.mimetype.replace("image/", '.') : ".png";
			let file_key = `bannerfiles/${owner_id}-${cur_category}${fileExtension}`;
			image_link = await _helper.utility.common.uploadImageToBucket(fileContent, file_key)
			// console.log("Image link ",image_link);
			if (!image_link) {
				return res.status(500).send({
					code: 3,
					message: "Our servers are busy at the moment. Please try again!",
					payload: {}
				})
			}

			await unlinkAsync(req.file.path);
			console.log("FILE UPLOAD COMPLETED SUCCESSFULLY")
		}

		
		fetchBannerById(String(banner_id)).then(result => {

			console.log("result of fetchBannerById :: ", result)

			if (categoryDetails.name == "Global") {
				console.log("In category feteched Global")

				let objToUpdate = {}
				if(image_link) {
					objToUpdate.image_link = image_link
				}
				objToUpdate.link = link
				objToUpdate.is_deleted = false
				objToUpdate.is_active = true

				bannerModel.updateOne(
					{ _id: mongoose.Types.ObjectId(String(banner_id)) },
					{ $set: objToUpdate },
					(err, result) => {
						if (err) {
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
							payload: result
						})
					})
			} else {

				// Make all existing banner with this category_id and with this banner_id is_active:false
				// Only make the last one true

				bannerModel.updateMany(
					{
						owner_id: mongoose.Types.ObjectId(String(owner_id)),
						category_id: mongoose.Types.ObjectId(String(category_id)),
					},
					{ $set: { is_active: false } },
					(err, result) => {
						if (err) {
							res.status(500).send({
								code: 3,
								message: "Error while uploading banner",
								payload: {}
							})
							return;
						}

						console.log("Updated many.. now updating one.. ")
						console.log("result :: ", result)
						// NOw only make the last one true

						console.log("image_link : ", image_link)
						console.log("image_link from database : ", image_link)


						let objToUpdate = {}
						if(image_link != null) {
							objToUpdate.image_link = image_link
						}
						objToUpdate.link = link
						objToUpdate.is_deleted = false
						objToUpdate.is_active = true
						objToUpdate.category_id = category_id

						bannerModel.updateOne(
							{ _id: mongoose.Types.ObjectId(String(banner_id)) },
							{ $set: objToUpdate },
							(err, result) => {
								if (err) {
									res.status(500).send({
										code: 3,
										message: "Error while uploading banner",
										payload: {}
									})
									return;
								}
								console.log("UPdate complete now sending back to client")
								console.log("result :: ", result)
								res.status(200).send({
									code: 1,
									status: true,
									message: "Banner uploaded successfully",
									payload: result
								})
							})
					})
			}
		}).catch(error => {
			res.status(500).send({
				code: 3,
				message: "Error occured while uploading banner.",
				payload: error
			})
		})
	} catch (error) {
		res.status(500).send({
			code: 3,
			message: "Error occured while uploading banner",
			payload: error
		})
	}
}

async function fetchBannerById(banner_id) {
	try {
		let bannerDetails = await bannerModel.findOne({ _id: mongoose.Types.ObjectId(banner_id) });
		return bannerDetails;
	} catch (error) {
		return error
	}
}