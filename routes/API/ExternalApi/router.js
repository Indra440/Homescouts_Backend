const router      = require('express').Router()
const controller  = require('./controller')
const _middlewares = require("../../../Middlewares/middleware");
const validators  = require('./validator')


router.post('/createAdmin',
    validators.createAdmin,
    _middlewares.api.externalApi.createAdmin,
    controller.createAdmin
)
router.post('/suspendAdmin',
    validators.manageUser,
    _middlewares.api.externalApi.suspendAdmin,
    controller.suspendAdmin
)
router.post('/unsuspendAdmin',
    validators.manageUser,
    _middlewares.api.externalApi.unsuspendAdmin,
    controller.unsuspendAdmin
)
router.post('/deleteAdmin',
    validators.manageUser,
    _middlewares.api.externalApi.deleteAdmin,
    controller.deleteAdmin
)



router.post('/createExtensionOwner',
    validators.createExtensionOwner,
    _middlewares.api.externalApi.createExtensionOwner,
    controller.createExtensionOwner
)
router.post('/suspendExtensionOwner',
    validators.manageUser,
    _middlewares.api.externalApi.suspendExtensionOwner,
    controller.suspendExtensionOwner
)
router.post('/unsuspendExtensionOwner',
    validators.manageUser,
    _middlewares.api.externalApi.unsuspendExtensionOwner,
    controller.unsuspendExtensionOwner
)
router.post('/deleteExtensionOwner',
    validators.manageUser,
    _middlewares.api.externalApi.deleteExtensionOwner,
    controller.deleteExtensionOwner
)


router.post('/createExtensionUser',
    validators.createExtensionUser,
    _middlewares.api.externalApi.createExtensionUser,
    controller.createExtensionUser
)
router.post('/suspendExtensionUser',
    validators.manageUser,
    _middlewares.api.externalApi.suspendExtensionUser,
    controller.suspendExtensionUser
)
router.post('/unsuspendExtensionUser',
    validators.manageUser,
    _middlewares.api.externalApi.unsuspendExtensionUser,
    controller.unsuspendExtensionUser
)
router.post('/deleteExtensionUser',
    validators.manageUser,
    _middlewares.api.externalApi.deleteExtensionUser,
    controller.deleteExtensionUser
)

router.get('/modifiedextensionModelForBanner',
    controller.modifiedextensionModelForBanner
)


module.exports = router