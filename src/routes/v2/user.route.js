import express from "express"
import { Joi, celebrate } from "celebrate"
const router = express.Router()

router.route("/register").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{6-16}"))
        .required()
        .min(8),
      confirmPassword: Joi.ref("password"),
      lat: Joi.string().optional(),
      long: Joi.string().optional(),
      role: Joi.string().default("user"),
    }),
  })
)

export default router
