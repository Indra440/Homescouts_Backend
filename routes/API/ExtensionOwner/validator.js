const Joi = require('joi');
const { join } = require('path');

const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

module.exports.create = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            first_name: Joi.string().allow(''),
            last_name: Joi.string().allow(''),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            balance: Joi.number().required(),
            manage_banner: Joi.boolean(),
            // associated_admin_id : Joi.string().required()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}

module.exports.updateBalance = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            extension_owner_id : Joi.string().required(),
            balance  : Joi.number().required(),
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}

function fileFilter(file){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/bmp'){
        return true;
    }else{
        return false;
    }
}

module.exports.editBanner = async(req, res, next) => {
    console.log("Came in edit banner validator for extensionOwner")
    try {
        const schema = Joi.object().keys({
            link  : Joi.string().required(),
            category_id:Joi.string().required(),
            banner_id: Joi.string().required()
        })
        console.log("req.body in edit :: ", req.body)
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                console.log("ERR MSG :: ", err)
                if(req.file) {
                    await unlinkAsync(req.file.path);
                }
                
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            if(req.file) {
                let filevalid = fileFilter(req.file);
                if(filevalid == false){
                    await unlinkAsync(req.file.path);
                    return res.status(500).send({
                        code: 3,
                        message: "Please check the file format and try again.",
                        payload: {}
                    })
                }
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        await unlinkAsync(req.file.path);
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters for edit banner.",
            payload: "error"
        })
    }
}

// module.exports.fetchRemainExtension = async (req, res, next) => {
//     try {
//         const schema = Joi.object().keys({
//             scenario : Joi.string().required(),
//         })
//         Joi.validate(req.body, schema, async function (err, value) {
//             if (err) {
//                 return res.status(500).send({
//                     code: 3,
//                     message: "Invalid Parameters",
//                     payload: err.details
//                 })
//             }
//             next()
//         });
//     } catch (error) {
//         console.log("error", error)
//         return res.status(500).send({
//             code: 3,
//             message: "Invalid Parameters",
//             payload: "error"
//         })
//     }
// }

module.exports.editExtensionOwner = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            extension_owner_id : Joi.string().required(),
            first_name: Joi.string().allow(''),
            last_name: Joi.string().allow(''),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            manage_banner: Joi.boolean(),
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}

module.exports.manageBanner = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            extension_owner_id : Joi.string().required()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}

module.exports.manageExtensionOwner = async(req,res,next) =>{
    try{
        const schema = Joi.object().keys({
            extensionowner_id:Joi.string().required()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    }catch(error){
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}


module.exports.createBroadcast = async(req,res,next) =>{
    try{
        const schema = Joi.object().keys({
            extension_id: Joi.string().required(),
            dateTime:Joi.string().required(),
            content:Joi.string().required(),
            link:Joi.string().required(),
            label:Joi.string().required()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    }catch(error){
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}