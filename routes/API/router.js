const router = require('express').Router()
const _middlewares = require("../../Middlewares/middleware");

router.use('/admin',
  _middlewares.api.auth.loginRequired,
  //create an middleware to allow only super user to hit this route
  require('./Admin/router')
)

router.use('/auth',
  // _middlewares.api.auth.user,
  require('./Auth/router')
)

router.use('/extension',
  _middlewares.api.auth.loginRequired,
  require('./Extension/router')
)

router.use('/extension-download',
  _middlewares.api.auth.isAuthorized,
  require('./Extension/router')
)

// router.use('/settings',
//   require('./Settings/router')
// )

router.use('/extensionowner',
  _middlewares.api.auth.loginRequired,
  //create an middleware to allow only admin user to hit this route
  require('./ExtensionOwner/router')
  )

  router.use('/extensionuser',
  _middlewares.api.auth.loginRequired,
  //create an middleware to allow only admin user to hit this route
  require('./ExtensionUser/router')
  )

  router.use('/externalapi',
  // _middlewares.api.auth.user,
  require('./ExternalApi/router')
)

// router.use('/subscribe-notification', require('./Notification/router'))


module.exports = router