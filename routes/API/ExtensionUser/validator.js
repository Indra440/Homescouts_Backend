const Joi = require('joi')


module.exports.create = async (req,res,next) => {
    try {
        const schema = Joi.object().keys({
            first_name: Joi.string().allow(''),
            last_name: Joi.string().allow(''),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            extension_id:Joi.string().required()
            // extensions : Joi.array().items({
            //     extension_id: Joi.string().required()
            // }).required()
            // extension_id : Joi.string()
        })
        Joi.validate(req.body, schema, async function  (err, value) {
            if(err){
                return res.status(500).send({
                    code    : 3,
                    message : "Invalid Parameters",
                    payload : err.details
                })
            }
            next()
         });  
    }catch(error) {
        console.log("error",error)
        return res.status(500).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : "error"
        })
    }
}

module.exports.manageExtensionUser = async (req,res,next) =>{
    try{
        const schema = Joi.object().keys({
            extensionouser_id:Joi.string().required(),
            extension_id:Joi.string().required()
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
