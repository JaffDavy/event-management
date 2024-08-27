import Joi from "joi";

const login = Joi.object({
    email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

export default function loginValidation(req, res, next) {
  try {
    const { error } = login.validate(req.body);

    if (error) {
      return res.status(400).send({
        message: "Validation error",
        details: error.details[0].message
      });
    }

    next();
  } catch (err) {
    return res.status(500).send({
      message: "Internal server error",
      details: err.message
    });
  }
}
