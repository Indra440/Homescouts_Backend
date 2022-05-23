const Joi = require("joi");
module.exports.passwordUpdate = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      password: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmNewPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .options({ language: { any: { allowOnly: "must match password" } } }),
    });
    Joi.validate(req.body, schema, function (err, value) {
      if (err) {
        return res.status(400).send({
          code: 3,
          message: "Invalid Parameters",
          payload: err.details,
        });
      }
      next();
    });
  } catch (error) {
    return res.status(400).send({
      code: 3,
      message: "Invalid Parameters",
      payload: error,
    });
  }
};
