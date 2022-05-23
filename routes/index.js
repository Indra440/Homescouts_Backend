const router = require('express').Router()


router.use('/api', require('./API/router'))
/**
 * -----------------------------------------------------------------
 * Node, Express, Mongodb and React js Application
 * -----------------------------------------------------------------
 * NAME : index.js
 * PURPOSE : All the routes,controllers,Middlewares and validators are imported in this file
 */

//Controllers
// const { login, privateRoute }              = require('../controllers/authController')
// const { login, create, privateRoute } = require('../controllers/adminController')


// //Middlewares
// const { isAuthorized, loginRequired, isSystemConfig, verifyToken } = require('./middleware')

// //Validators
// const {loginValidator, createAdminValidator} = require('./validator')



// router.post('/login',
//     loginValidator,
//     login
// )

// //create admin with static token SECRET 
// router.post('/createAdmin',
//     verifyToken,
//     createAdminValidator,
//     create
// )

// //Manager level routes
// router.post('/createManager',
//     loginRequired,
//     checkPermissions,
//     createManagerValidator,
//     create
// )


// //Agent level routes
// router.post('/createAgent',
//     loginRequired,
//     checkPermessions,
//     createAgentrValidator,
//     create
// )

// router.post('/authenticated',
//     loginRequired,
//     privateRoute
// )

 module.exports = router