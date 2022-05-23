const Joi = require('joi');
const { join } = require('path');
const _helper = require('../../../Helpers/helpers');
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);


module.exports.create = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            category_id: Joi.string().required(),
            short_description: Joi.string().required(),
            long_description: Joi.string().required(),
            version:Joi.string().required(),
            enable_signup:Joi.boolean().optional().allow(''),
            signup_link : Joi.string().optional().allow('')
        })
        let files = req.files;
        if(files.small_icon && files.medium_icon && files.large_icon && files.primary_logo){
            Joi.validate(req.body, schema, async function (err, value) {
                if (err) {
                    await _helper.utility.extension.remove_all_files_for_extension(files)
                    return res.status(500).send({
                        code: 3,
                        message: "Invalid Parameters",
                        payload: err.details
                    })
                }
                next()
            });
        }else{
            await _helper.utility.extension.remove_all_files_for_extension(files)
            return res.status(500).send({
                code: 3,
                message: "Invalid Parameters",
                payload: {}
            })
        }
    } catch (error) {
        await _helper.utility.extension.remove_all_files_for_extension(files)
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

module.exports.updateVersion = async (req,res,next) =>{
    try {
        const schema = Joi.object().keys({
            extensionVersion : Joi.string().required(),
            extension_id : Joi.string().required()
        })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

module.exports.updateLogo = async (req,res,next) =>{
    let file = req.file;
    try {
        const schema = Joi.object().keys({
            extensionLogo : Joi.any().meta({swaggerType: 'file'}),
            extension_id : Joi.string().required()
        })
        if(file && !(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg')){
            file ? await unlinkAsync(file.path) : "";
            return res.status(500).send({
                code: 3,
                message: "Please check your file format",
                payload: {}
            })
        }
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                file ? await unlinkAsync(file.path) : "";
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err
                })
            }
            next()
        });
    } catch (error) {
        file ? await unlinkAsync(file.path) : "";
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

module.exports.uploadvideo = async (req, res, next) => {
    let file = req.file;
    let banner_link = req.body.banner_link;
    try {
        const schema = Joi.object().keys({
            extension_id : Joi.string().required(),
            video_title: Joi.string().required(),
            video_link: Joi.string().required(),
            video_description: Joi.string().required(),
            videoBanner : Joi.any().meta({swaggerType: 'file'}).optional().allow(''),
            enable_banner : Joi.boolean().required(),
            delay_time : Joi.number().optional().allow(''),
            banner_link : Joi.string().optional().allow('')
        })
        if(file && !(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype === 'image/bmp')){
            file ? await unlinkAsync(file.path) : "";
            return res.status(500).send({
                code: 3,
                message: "Please check your file format",
                payload: {}
            })
        }
        if(file && !(banner_link || banner_link != "")){
            file ? await unlinkAsync(file.path) : "";
            return res.status(500).send({
                code: 3,
                message: "Invalid Parameters",
                payload: {}
            })
        }
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                file ? await unlinkAsync(file.path) : "";
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err
                })
            }
            next()
        });
    } catch (error) {
        file ? await unlinkAsync(file.path) : "";
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

module.exports.updatedvideo = async (req, res, next) => {
    let file = req.file;
    let banner_link = req.body.banner_link;
    try {
        const schema = Joi.object().keys({
            extension_id : Joi.string().required(),
            video_id: Joi.string().required(),
            video_title: Joi.string().required(),
            video_link: Joi.string().required(),
            video_description: Joi.string().required(),
            enable_banner : Joi.boolean().required(),
            videoBanner : Joi.any().meta({swaggerType: 'file'}).optional().allow(''),
            banner_link : Joi.string().optional().allow('')
        })
        if(file && !(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype === 'image/bmp')){
            file ? await unlinkAsync(file.path) : "";
            return res.status(500).send({
                code: 3,
                message: "Please check your file format",
                payload: {}
            })
        }
        if(file && !(banner_link || banner_link != "")){
            file ? await unlinkAsync(file.path) : "";
            return res.status(500).send({
                code: 3,
                message: "Invalid Parameters",
                payload: {}
            })
        }
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                file ? await unlinkAsync(file.path) : "";
                return res.status(500).send({
                    code: 3,
                    message: "Invalid Parameters",
                    payload: err
                })
            }
            next()
        });
    } catch (error) {
        file ? await unlinkAsync(file.path) : "";
        console.log("error", error)
        return res.status(500).send({
            code: 3,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

    module.exports.deleteVideo = async (req,res,next) => {
        try {
            const schema = Joi.object().keys({
                video_id: Joi.string().required(),
                extension_id: Joi.string().required()
            })
            Joi.validate(req.body, schema, async function (err, value) {
                if (err) {
                    return res.status(500).send({
                        code: 3,
                        message: "Invalid Parameters",
                        payload: err
                    })
                }
                next()
            });
        } catch (error) {
            console.log("error", error)
            return res.status(500).send({
                code: 3,
                message: "Invalid Parameters",
                payload: error
            })
        }
    }

    module.exports.updateSignupLink = async (req,res,next) => {
        try {
            const schema = Joi.object().keys({
                enable_signup: Joi.boolean().required(),
                signup_link : Joi.string().optional().allow(''),
                extension_id: Joi.string().required()
            })
            Joi.validate(req.body, schema, async function (err, value) {
                if (err) {
                    return res.status(500).send({
                        code: 3,
                        message: "Invalid Parameters",
                        payload: err
                    })
                }
                next()
            });
        } catch (error) {
            console.log("error", error)
            return res.status(500).send({
                code: 3,
                message: "Invalid Parameters",
                payload: error
            })
        }
    }




