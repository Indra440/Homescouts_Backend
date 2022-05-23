const { rejects } = require("assert");
const config = require("config");
const nodemailer = require("nodemailer");
const { resolve } = require("path");
const mailConfig = config.get("emailConfig");
const url = config.get("url");

module.exports.sendPasswordResetLink = async (email, token, userType) => {
  try {
    return new Promise(async (resolve, reject) => {
      let link = url + "reset-password/" + userType + "/" + token;
      let mailContent =
        "<p>Click here to reset the password <a href='//" +
        link +
        " 'target='_blank'>" +
        link +
        "</a></p>";
      console.log("coming here", mailConfig);
      const transporter = nodemailer.createTransport({
        service: mailConfig.provider,
        auth: {
          user: mailConfig.email,
          pass: mailConfig.password,
        },
      });

      const mailOptions = {
        from: mailConfig.email,
        to: email,
        subject: "Password Reset",
        html: mailContent,
      };
      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Send mail error: ", error);
          resolve(false);
        } else {
          console.log("Email sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (error) {
    return false;
  }
};
