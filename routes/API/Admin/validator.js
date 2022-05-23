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
            // user_type: Joi.number().required(),
            balance: Joi.number().required(),
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
            admin_id : Joi.string().required(),
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



module.exports.uploadBanner = async(req,res,next) =>{
    console.log("in uploadBanner validator")
    try {
        const schema = Joi.object().keys({
            link  : Joi.string().required(),
            category_id:Joi.string().optional().allow(''),
            extension_id:Joi.string().optional().allow('')
        })
        console.log("req.body in upload : ", req.body)
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                if(req.file) {
                    await unlinkAsync(req.file.path);
                }
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            let filevalid = fileFilter(req.file);
            if(filevalid == false){

                await unlinkAsync(req.file.path);
                return res.status(500).send({
                    code: 3,
                    message: "Please check the file format",
                    payload: {}
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        await unlinkAsync(req.file.path);
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}

module.exports.editBanner = async(req, res, next) =>{
    console.log("Came in edit banner validator")
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

module.exports.fetchAllBanner = async(req,res,next) =>{
    try {
        const schema = Joi.object().keys({
            category_id:Joi.string(),
            category_id:Joi.string()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                await unlinkAsync(req.file.path);
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
        await unlinkAsync(req.file.path);
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}


module.exports.manageAdmin = async(req,res,next) =>{
    try{
        const schema = Joi.object().keys({
            admin_id:Joi.string().required()
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
            payload: "error"
        })
    }
}

module.exports.deleteBanner = async(req,res,next) =>{
    try {
        const schema = Joi.object().keys({
            banner_id:Joi.string().required()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                await unlinkAsync(req.file.path);
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
        await unlinkAsync(req.file.path);
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: "error"
        })
    }
}

module.exports.toggleBanner = async (req,res,next) =>{
    try{
        const schema = Joi.object().keys({
            banner_id:Joi.string().required()
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






 
