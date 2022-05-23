const router       = require('express').Router()
const controller   = require('./controller')
const _middlewares = require('../../../Middlewares/middleware')
const validators   = require('./validator')


router.post('/create',
   validators.create,
   _middlewares.api.extensionUser.create,
    controller.create
)



router.get('/findAll',
    controller.findAll
)

router.post('/suspendExtensionUser',
    validators.manageExtensionUser,
    _middlewares.api.extensionUser.manageExtensionUser,
    controller.suspendExtensionUser
)

router.post('/unsuspendExtensionUser',
    validators.manageExtensionUser,
    _middlewares.api.extensionUser.manageExtensionUser,
    controller.unsuspendExtensionUser
)

router.post('/deleteExtensionUser',
    validators.manageExtensionUser,
    _middlewares.api.extensionUser.manageExtensionUser,
    controller.deleteExtensionUser
)

router.get('/fetch-video', controller.fetchVideo)

router.get('/fetch-banner-ad', controller.fetchBannerAdApi)

router.get('/fetch-useful-links',
    _middlewares.api.extensionUser.fetchUsefulLinks,
    controller.fetchUsefulLinks
)
module.exports = router