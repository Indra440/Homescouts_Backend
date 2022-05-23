const config       = require('config')
const jsonwebtoken = require('jsonwebtoken')
const API_TOKEN    = config.get('api-token')
const extensionsModel = require('../../models/mongoose/extensions');

module.exports.verifyStaticToken = async(req,res,next) => {
    if(API_TOKEN == req.body.token){
        return next()
    }else {
        return res.send({
            code    : 3,
            message : "You dont have valid token",
            payload :{}
        })
    }
}

/**
 * Middleware to check if user has logged in
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
module.exports.loginRequired = async(req,res,next) => {
    console.log({"req.user":req.user}, req.body)
    if (req.user) {
        next();
      } else {
        return res.status(401).json({ message: 'Unauthorized user!' });
      }
}

/**
 * Middleware to save user info and permessions info in req.user object
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
module.exports.isAuthorized = async(req,res,next) => {

    //   console.log("headers",req.headers);
    // console.log(req.headers.authorization.split(' ')[0])
    console.log("req : ", req._parsedUrl.pathname == "/api/extension/download")
    if(req._parsedUrl.pathname == "/api/extension/download") {
        return next()
    }
    if(req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT'){
     
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1],'secret',function(err,decode){
            console.log("error",err)
            if(err) req.user = undefined;
            
            req.user = decode;
            console.log("req.user --- isAuthorised middleware",req.user)
            next();
        })
    }else{
        req.user = undefined
        console.log("req.user --- isAuthorised middleware",req.user)

        next()
    }
}

module.exports.fetchSignupLink = async (req,res,next)=>{
    const extension_id = req.body.extension_id;
    try{
        const extension = await extensionsModel.findOne({_id:extension_id,is_active:true})
        if(!extension){
            res.status(500).send({
                code: 4,
                message: "Extension is not active",
                payload: {}
            })
        }
        req.extension_details = extension;
        next();
    }catch(error){
        res.status(500).send({
            code: 4,
            message: "Error occured while fetxhing video",
            payload: error
        })
    }
}




// function isAuthorized(req,res,next){
//     console.log(req.headers);
//     // console.log(req.headers.authorization.split(' ')[0])
//     if(req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT'){
     
//         jsonwebtoken.verify(req.headers.authorization.split(' ')[1],'secret',function(err,decode){
//             console.log("error",err)
//             if(err) req.user = undefined;
            
//             req.user = decode;
//             console.log("req.user",req.user)
//             next();
//         })
//     }else{
//         req.user = undefined
//         next()
//     }

// }
