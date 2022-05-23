const Joi = require('joi');
const { join } = require('path');


module.exports.createAdmin = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            first_name: Joi.string().optional().allow(''),
            last_name: Joi.string().optional().allow(''),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            balance: Joi.number().required(),
            token : Joi.string().required()
            // associated_admin_id : Joi.string().required()
        }).options({ allowUnknown: true })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(200).send({
                    code: 3,
                    status: false,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(200).send({
            code: 3,
            status: false,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

module.exports.manageUser = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            token : Joi.string().required(),
            extension_token : Joi.string().required()
        }).options({ allowUnknown: true })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(200).send({
                    code: 3,
                    status: false,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(200).send({
            code: 3,
            status: false,
            message: "Invalid Parameters",
            payload: error
        })
    }
}

module.exports.createExtensionOwner = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            first_name: Joi.string().optional().allow(''),
            last_name: Joi.string().optional().allow(''),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            token : Joi.string().required(),
            balance: Joi.number().required(),
            manage_banner: Joi.boolean().optional()
        }).options({ allowUnknown: true })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(200).send({
                    code: 3,
                    status: false,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(200).send({
            code: 3,
            status: false,
            message: "Invalid Parameters",
            payload: error
        })
    }
}


module.exports.createExtensionUser = async (req,res,next) =>{
    try {
        const schema = Joi.object().keys({
            first_name: Joi.string().optional().allow(''),
            last_name: Joi.string().optional().allow(''),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            token : Joi.string().required(),
            extension_token : Joi.string().required()
        }).options({ allowUnknown: true })
        Joi.validate(req.body, schema, async function (err, value) {
            if (err) {
                return res.status(200).send({
                    code: 3,
                    status: false,
                    message: "Invalid Parameters",
                    payload: err.details
                })
            }
            next()
        });
    } catch (error) {
        console.log("error", error)
        return res.status(200).send({
            code: 3,
            status: false,
            message: "Invalid Parameters",
            payload: error
        })
    }
}



