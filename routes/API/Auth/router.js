const router       = require('express').Router()
const controller   = require('./controller')
const _middlewares = require('../../../Middlewares/middleware')
const validators   = require('./validator')

// router.post('/createAdmin',
//     _middlewares.api.auth.verifyStaticToken,
//     validators.createAdmin,
//     controller.createAdmin
// )

router.post('/login',
    validators.login,
    controller.login
)

router.post('/extensionUserLogin',
    validators.extensionUserLogin,
    controller.extensionUserLogin
)

router.get('/checkUserStatus',
    validators.checkUserStatus,
    controller.checkUserStatus
)

router.post('/forgotPassword',
    validators.forgotPasswordCheck,
    controller.forgotPassword
);

router.post('/resetPassword',
    validators.resetPasswordCheck,
    controller.resetPassword
);

router.post('/password-update',
    validators.passwordUpdate,
    controller.updatePassword
)

router.post('/fetch-primary-logo',
    validators.fetchPrimaryLogo,
    controller.fetchPrimaryLogo
)

router.post('/fetchSignupLink',
    validators.fetchSignupLink,
    _middlewares.api.auth.fetchSignupLink,
    controller.fetchSignupLink
)

module.exports = router