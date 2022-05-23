const router      = require('express').Router()
const controller  = require('./controller')
const _middlewares = require("../../../Middlewares/middleware");
const validators  = require('./validator')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


router.post('/create',
    validators.create,
    controller.create
)

router.get('/findAll',
    controller.findAll
)

router.post('/updateBalance',
    validators.updateBalance,
    controller.updateBalance
)

router.post('/editExtensionOwner',
    validators.editExtensionOwner,
    _middlewares.api.extensionOwner.editExtensionOwner,
    controller.editExtensionOwner
)

router.post('/manageBanner',
    validators.manageBanner,
    controller.manageBanner
)

router.post('/suspendExtensionOwner',
    validators.manageExtensionOwner,
    _middlewares.api.extensionOwner.suspendExtensionOwner,
    controller.suspendExtensionOwner
)

router.post('/unsuspendExtensionOwner',
    validators.manageExtensionOwner,
    _middlewares.api.extensionOwner.unsuspendExtensionOwner,
    controller.unsuspendExtensionOwner
)

router.post('/deleteExtensionOwner',
    validators.manageExtensionOwner,
    _middlewares.api.extensionOwner.deleteExtensionOwner,
    controller.deleteExtensionOwner
)

// router.post('/login',
//     // middlewares.api.auth.verifyStaticToken,
//     validators.login,
//     controller.login
// )

router.post('/create-button',
    _middlewares.api.extensionOwner.getExtId,
    _middlewares.api.extensionOwner.validateLabelAndLink,
    controller.createButton
)

router.post('/update-button',
    _middlewares.api.extensionOwner.getExtId,
    _middlewares.api.extensionOwner.checkButtonExists,
    _middlewares.api.extensionOwner.validateLabelAndLink,
    controller.updateButton
)

router.get('/buttons',
    // _middlewares.api.extensionOwner.getExtId,
    controller.fetchButtons
)

router.post('/delete-button',
    _middlewares.api.extensionOwner.getExtId,
    _middlewares.api.extensionOwner.checkButtonExists,
    controller.deleteButton
)

router.get('/fetch-manage-banner-status',
    controller.fetchBannerStatus
)

router.post('/create-broadcast',
    validators.createBroadcast,
    controller.createBroadcast
)
router.get('/fetch-broadcast',
    _middlewares.api.auth.isAuthorized,
    controller.fetchBroadcast
)

router.post('/editBanner',
    upload.single('bannerFile'),
    validators.editBanner,
    _middlewares.api.admin.editBanner,
    controller.editBanner
)

// router.post('/fetchRemainExtension',
//     validators.fetchRemainExtension,
//     controller.fetchRemainExtension
// )

router.get('/fetch-Balance',
    controller.fetchBalance
)

module.exports = router