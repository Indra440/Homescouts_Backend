const router       = require('express').Router()
const controller   = require('./controller')
const _middlewares = require('../../../Middlewares/middleware')
const validators   = require('./validator')



router.post('/password-update',
    validators.passwordUpdate,
    controller.updatePassword
)
