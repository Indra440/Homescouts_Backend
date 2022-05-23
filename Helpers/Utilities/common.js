const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");
const config = require("config");
const fs = require("fs");

module.exports.encryptPassword = async(saltRounds,plainPassword) => {
    return new Promise((resolve, reject) => { 
try{
    console.log("BCRYPT IS CALLED ---------------------------------------")
    console.log(saltRounds,plainPassword)
    bcrypt.hash(plainPassword, saltRounds)
    .then(function(hash) {
        console.log("hash in util",hash)
        resolve(hash)
    })
    .catch(error => {
        reject(error)
    })
}catch(error){
     reject(error)
   }       
 })
}

module.exports.checkPassword = async (plainPassword,hash) => {
  return new Promise((resolve, reject) => {
      try {
          console.log("Comparing password  : -------",plainPassword,hash)
        bcrypt.compare(plainPassword, hash).then(function(res) {
            console.log("checking password ",res)
            resolve(res)
        });
      } catch (error) {
          reject(error)
      }
  })   
}

module.exports.uploadImageToBucket = async (fileContent,file_key)=>{
    console.log("file_key : ", file_key)
    return new Promise((resolve, reject) => {
        try {
            const s3 = new AWS.S3({
                secretAccessKey : config.get('AWS.S3.AWS_IAM_USER_SECRET'),
                accessKeyId : config.get('AWS.S3.AWS_IAM_USER_KEY'),
                region:config.get('AWS.S3.REGION')
              });
            const params = {
                Bucket: config.get('AWS.S3.AWS_BUCKET_NAME'),
                Key: file_key, // File name you want to save as in S3
                Body: fileContent,
            };
            console.log("params : ", params)
            s3.upload(params, async function (err, data) {
                if(err){
                    reject(err);
                }else{
                    resolve(data.Location)
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.downloadImageFromBucket = async (filename, folder) => {
    console.log("Starting Download... ")
    return new Promise((resolve, reject) => {
        try {
            console.log("__dirname :" , __dirname)
            console.log("accessKeyId : ", config.get('AWS.S3.AWS_IAM_USER_KEY'))
            console.log("secretAccessKey : ", config.get('AWS.S3.AWS_IAM_USER_SECRET'))
            console.log("region : ", config.get('AWS.S3.REGION'))
            console.log("Bucket : ", config.get('AWS.S3.AWS_BUCKET_NAME'))
            const s3 = new AWS.S3({
                accessKeyId: config.get('AWS.S3.AWS_IAM_USER_KEY'),
                secretAccessKey: config.get('AWS.S3.AWS_IAM_USER_SECRET'),
                region: config.get('AWS.S3.REGION')
            });

            console.log("aws key : ", filename)
            console.log("folder : ", folder)
            const params = {
                Bucket: config.get('AWS.S3.AWS_BUCKET_NAME'),
                Key: String(filename).trim()
            };
        
            s3.getObject(params, (err, data) => {
                if(err) {
                    console.error(err);
                    reject(err)
                } else {
                    // console.log(this.config.baseFolder + baseImage);

                    // fs.writeFileSync(folder + filename, data.Body);
                    console.log("Image Downloaded.");
                    resolve(data.Body)
                }
                
            });
        } catch(e) {
            reject(e)
        }
    })
}



