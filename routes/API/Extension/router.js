const config = require('config');
const router      = require('express').Router()
const controller  = require('./controller')
const _middlewares = require("../../../Middlewares/middleware");
const validators  = require('./validator')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/',limits: {fileSize: config.get("image-max-size")}})


router.post('/create',
    _middlewares.api.extension.uploadExtensionFile,
    validators.create,
    _middlewares.api.extension.create,
    controller.create
)

router.get('/findAll',
    // middlewares.api.auth.verifyStaticToken,
    // validators.login,
    controller.findAll
)
router.get('/findExtension',
    controller.findExtension
)
router.post('/updateVersion',
    validators.updateVersion,
    _middlewares.api.extension.updateVersion,
    controller.updateVersion
)

router.post('/updateSignupLink',
    validators.updateSignupLink,
    _middlewares.api.extension.updateSignupLink,
    controller.updateSignupLink
)
router.post('/updateLogo',
    upload.single('extensionLogo'),
    validators.updateLogo,
    _middlewares.api.extension.updateLogo,
    controller.updateLogo
)

router.post('/uploadvideo',
    upload.single('videoBanner'),
    validators.uploadvideo,
    _middlewares.api.extension.uploadandupdatevideo,
    controller.uploadvideo
)

router.post('/updatedvideo',
    upload.single('videoBanner'),
    validators.updatedvideo,
    _middlewares.api.extension.uploadandupdatevideo,
    controller.updatedvideo
)
// router.post('/updateVideo',
//     upload.single('videoBanner'),
//     validators.updateVideo,
//     _middlewares.api.extension.uploadvideo,
//     controller.updateVideo
// )
router.get('/listVideo',
    _middlewares.api.extension.manageVideo,
    controller.listVideo
)
router.post('/deleteVideo',
    validators.deleteVideo,
    _middlewares.api.extension.manageVideo,
    controller.deleteVideo
)
router.post('/download', controller.downloadExtensionApi)

// router.post('/fetch-baner-ad', controller.fetchBannerAdApi)

module.exports = router