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

router.post('/editBanner',
    upload.single('bannerFile'),
    validators.editBanner,
    _middlewares.api.admin.editBanner,
    controller.editBanner
)

router.post('/uploadBanner',
    upload.single('bannerFile'),
    validators.uploadBanner,
    _middlewares.api.admin.uploadBanner,
    controller.uploadBanner
)



router.post('/deleteBanner',
    validators.deleteBanner,
    _middlewares.api.auth.isAuthorized,
    controller.deleteBanner
)

router.post('/toggleBanner',
    validators.toggleBanner,
    _middlewares.api.admin.toggleBanner,
    controller.toggleBanner
)

router.get('/fetchAllCategory',
    controller.fetchAllCategory
)

router.get('/fetchAllBanner',
    validators.fetchAllBanner,
    controller.fetchAllBanner
)

// router.post('/toggleBanner',
//     validators.fetchAllBanner,
//     controller.fetchAllBanner
// )

router.get('/dashboardStats',
    controller.dashboardStats
)

router.post('/suspendAdmin',
    validators.manageAdmin,
    _middlewares.api.admin.suspendAdmin,
    controller.suspendAdmin
)

router.post('/unsuspendAdmin',
    validators.manageAdmin,
    _middlewares.api.admin.unsuspendAdmin,
    controller.unsuspendAdmin
)

router.post('/deleteAdmin',
    validators.manageAdmin,
    _middlewares.api.admin.deleteAdmin,
    controller.deleteAdmin
)


// router.post('/login',
//     // middlewares.api.auth.verifyStaticToken,
//     validators.login,
//     controller.login
// )
module.exports = router