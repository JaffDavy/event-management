import Joi from "joi";

const register = Joi.object({
  full_name: Joi.string().min(4).max(50).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required()
});

export default function registrationValidation(req, res, next) {
  try {
    const { error } = register.validate(req.body);

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
