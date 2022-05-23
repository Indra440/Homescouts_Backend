const userModel = require("../../../models/mongoose/users");
const _helper = require("../../../Helpers/helpers");
const jwt = require("jsonwebtoken");
const config = require("config");
const { user } = require("../../../Middlewares/API/api");

module.exports.updatePassword = async (req, res) => {
  try {
    let user = await userModel.findOne({
      _id: req.user.user.id,
      is_deleted: false,
    });
    if (!user) {
      res.status(500).send({
        code: 0,
        message: "Invalid Token",
        payload: {},
      });
    }
    const passwordCheck = await _helper.utility.common.encryptPassword(
      10,
      req.body.password
    );
    if (passwordCheck != user.password) {
      res.status(400).send({
        code: 0,
        message: "Incorrect current password",
        payload: {},
      });
    }

    const hash = await _helper.utility.common.encryptPassword(
      10,
      req.body.newPassword
    );
    user.password = hash;
    console.log("user :::: ", user);
    await user.save();
    res.status(200).send({
      code: 1,
      status: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    res.status(500).send({
      code: 3,
      message: "Error while resetting password",
      payload: {},
    });
  }
};
