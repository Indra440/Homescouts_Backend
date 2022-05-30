const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const http = require("http");
const config = require("config");
const appRoutes = require("./routes/index");
// const mongoose = require("./database/mongo");
const _middlewares = require("./Middlewares/middleware");
// const seeder =  require('./database/mongoSeeders')
const downloadExtController = require('./routes/API/Extension/controller')
// const Sequelize = require('./models/sequelise/sequelize')
// const notity = require('./Helpers/Utilities/notify')
// Set up the express app
const app = express();
var schedule = require('node-schedule');
 
// var j = schedule.scheduleJob('* * * * *', notity.notifyUser);
// var k = schedule.scheduleJob('* * * * *', notity.notifyVideoUpdate);
// console.log('j : ', j)

// Log requests to the console.
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public/build")));
app.use('/uploads', express.static(path.join(__dirname, '/src/public')))
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
console.log("App name ", config.get("name"));
app.use("/", _middlewares.api.auth.isAuthorized, appRoutes);
// router.get('/extension/download:id', controller.downloadExtensionApi)
app.use(helmet());



// app.get('/extension/download/:id', async (req,res) => {
//   console.log("-id :: ", req.params.id)
//   let file = await downloadExtController.downloadExtensionApi(req, res)
//   console.log("file name obtained :: ", file)
//   res.writeHead(301, { "Location": "http://" + req.headers['host'] + file });
//   return res.end("done");
// })

app.disable("x-powered-by");
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/build/index.html"));
});
const PORT = process.env.PORT || 6969;
// app.set("PORT", PORT);
const server = http.createServer(app);
server.listen(PORT, function (err, data) {
  console.log(`Your-Chrome-Extension running on PORT ${PORT}`);
});

module.exports = app;
