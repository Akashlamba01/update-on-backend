import express from "express"
import { Joi, celebrate } from "celebrate"
import {
  otpVerify,
  otpSend,
  foretPassword,
  create,
  read,
  update,
} from "../../controllers/auth.controller.js"
import { verifyJwt } from "../../middlewares/auth.middleware.js"
const router = express.Router()

router.route("/register").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{6,16}$")) // Use {6,16} for length range
        .min(8) // Ensure the password is at least 8 characters long
        .required(),
      confirmPassword: Joi.ref("password"),
      lat: Joi.string().optional(),
      long: Joi.string().optional(),
      role: Joi.string().default("user"),
    }),
  }),
  create
)

// router.route("/logoin").post()

router.route("/get-profile").post(
  celebrate({
    body: Joi.string().default("user"),
  }),
  verifyJwt,
  read
)

router.route("/update-profile").post(
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      fullName: Joi.string().optional(),
      phoneNumber: Joi.string()
        .regex(/^[0-9]{8,15}$/)
        .optional(),
      gender: Joi.string().valid("male", "female", "other"),
      birthday: Joi.string().optional(),
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  update
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
      OTP: Joi.number().min(100000).max(999999).required(),
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
