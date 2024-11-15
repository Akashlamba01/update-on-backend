import express from "express"
import { Joi, celebrate } from "celebrate"
import {
  otpVerify,
  otpSend,
  foretPassword,
  create,
} from "../../controllers/auth.controller.js"
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
  }),
  create
)

router.route("/send-code").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      role: Joi.string().default("user"),
    }),
  }),
  otpSend
)

router.route("/verify-code").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      role: Joi.string().default("user"),
      OTP: Joi.number().required().max(6).min(6),
    }),
  }),
  otpVerify
)

router.route("/forget-password").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      role: Joi.string().default("user"),
      password: Joi.string()
        .pattern(new RegExp("[^a-zA-Z0-9!@#$%^&*]{6-16}"))
        .required()
        .min(8),
      confirmPassword: Joi.ref("password"),
    }),
  }),
  foretPassword
)

export default router
