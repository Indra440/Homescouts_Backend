const Joi = require('joi')
module.exports.login = async (req,res,next) => {
    try{
        const schema = Joi.object().keys({
            email    : Joi.string().email({ minDomainAtoms: 2 }).required(),
            password : Joi.string().required(),
            
        })
        Joi.validate(req.body, schema, function (err, value) {
            if(err){
                return res.status(400).send({
                    code    : 3,
                    message : "Invalid Parameters",
                    payload : err.details
                })
            }
            next()
         }); 
         
    }catch(error){
        return res.status(400).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : error
        })
    }
}

module.exports.extensionUserLogin = async (req,res,next) => {
    try{
        const schema = Joi.object().keys({
            email    : Joi.string().email({ minDomainAtoms: 2 }).required(),
            password : Joi.string().required(),
            extension_id:Joi.string().required()
        })
        Joi.validate(req.body, schema, function (err, value) {
            if(err){
                return res.status(400).send({
                    code    : 3,
                    message : "Invalid Parameters",
                    payload : err.details
                })
            }
            next()
         }); 
         
    }catch(error){
        return res.status(400).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : error
        })
    }
}

module.exports.checkUserStatus = async (req,res,next) => {
    let user = req.user;
    if(user){
        next();
    }else{
        return res.status(400).send({
            code    : 3,
            message : "Unauthorized user!",
            payload : {"status":false}
        })
    }
}

module.exports.forgotPasswordCheck = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            email : Joi.string().email({ minDomainAtoms: 2 }).required(),
            extensionId: Joi.any().optional()
        });
        Joi.validate(req.body, schema, function (err, value) {
            if(err){
                return res.status(400).send({
                    code    : 3,
                    message : "Invalid Parameterss",
                    payload : err.details
                })
            }
            next()
         }); 
    } catch(error) {
        return res.status(400).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : error
        })
    }
}

module.exports.resetPasswordCheck = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            token : Joi.string().required(),
            type: Joi.number().required(),
            newPassword : Joi.string().required(),
            confirmNewPassword : Joi.any().valid(Joi.ref('newPassword')).required().options({ language: { any: { allowOnly: 'must match password' } } })
        });
        Joi.validate(req.body, schema, function (err, value) {
            if(err){
                return res.status(400).send({
                    code    : 3, 
                    message : "Invalid Parameters",
                    payload : err.details
                })
            }
            next()
         }); 
    } catch(error) {
        return res.status(400).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : error
        })
    }
}

// module.exports.createAdmin = async (req,res,next) => {
//     try {
//         const schema = Joi.object().keys({
//             name     : Joi.string().required(),
//             email    : Joi.string().email({ minDomainAtoms: 2 }).required(),
//             token    : Joi.string().required()
//         })
//         Joi.validate(req.body, schema, async function  (err, value) {
//             if(err){
//                 return res.send({
//                     code    : 3,
//                     message : "Invalid Parameters",
//                     payload : err.details
//                 })
//             }
//             next()
//          });  
//     }catch(error) {
//         console.log("error",error)
//         return res.send({
//             code    : 3,
//             message : "Invalid Parameters",
//             payload : "error"
//         })
//     }
// }

module.exports.passwordUpdate = async (req, res, next) => {
    try {
      const schema = Joi.object().keys({
        password: Joi.string().required(),
        newPassword: Joi.string().required(),
        extensionId :Joi.string().required(),
        confirmNewPassword: Joi.any()
          .valid(Joi.ref("newPassword"))
          .required()
          .options({ language: { any: { allowOnly: "must match password" } } }),
        extensionId: Joi.any().optional()
      });
      Joi.validate(req.body, schema, function (err, value) {
        if (err) {
          return res.status(400).send({
            code: 3,
            message: "Invalid Parameters",
            payload: err.details,
          });
        }
        next();
      });
    } catch (error) {
      return res.status(400).send({
        code: 3,
        message: "Invalid Parameters",
        payload: error,
      });
    }
  };

  module.exports.fetchPrimaryLogo = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            extension_id : Joi.string().required()
        });
        Joi.validate(req.body, schema, function (err, value) {
            if(err){
                return res.status(400).send({
                    code    : 3,
                    message : "Invalid Parameterss",
                    payload : err.details
                })
            }
            next()
         }); 
    } catch(error) {
        return res.status(400).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : error
        })
    }
}

module.exports.fetchSignupLink = async (req, res, next) => {
    try {
        const schema = Joi.object().keys({
            extension_id : Joi.string().required()
        });
        Joi.validate(req.body, schema, function (err, value) {
            if(err){
                return res.status(400).send({
                    code    : 3,
                    message : "Invalid Parameterss",
                    payload : err.details
                })
            }
            next()
         }); 
    } catch(error) {
        return res.status(400).send({
            code    : 3,
            message : "Invalid Parameters",
            payload : error
        })
    }
}