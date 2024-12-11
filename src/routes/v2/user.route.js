import express from "express"
import { Joi, celebrate } from "celebrate"
import {
  otpVerify,
  otpSend,
  createUser,
  loginUser,
  updateUser,
  forgetPassword,
  tokenRefresh,
  getProfile,
} from "../../controllers/auth.controller.js"
import { verifyJwt } from "../../middlewares/auth.middleware.js"
import {
  addAddress,
  getAddress,
  removeAddress,
  updateAddress,
} from "../../controllers/common.controller.js"
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
  createUser
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
        .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{6,16}$"))
        .min(8)
        .required(),
      confirmPassword: Joi.ref("password"),
    }),
  }),
  forgetPassword
)

router.route("/login").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      role: Joi.string().default("user"),
      password: Joi.string().required(),
      deviceToken: Joi.string().optional(),
      deviceType: Joi.string().optional().valid(1, 2, 3),
      lat: Joi.string().optional(),
      long: Joi.string().optional(),
    }),
  }),
  loginUser
)

router.route("/refresh-token").post(
  celebrate({
    body: Joi.object().keys({
      role: Joi.string().default("user"),
      refreshToken: Joi.string().optional(),
    }),
  }),
  tokenRefresh
)

router.route("/get-profile").get(
  celebrate({
    body: Joi.object().keys({
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  getProfile
)

router.route("/update-profile").post(
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string().lowercase().optional(),
      lastName: Joi.string().lowercase().optional(),
      fullName: Joi.string().lowercase().optional(),
      // avtar: Joi.string().lowercase().optional(),
      // coverImage: Joi.string().lowercase().optional(),
      phoneNumber: Joi.string()
        .regex(/^[0-9]{8,15}$/)
        .optional(),
      gender: Joi.string().valid("male", "female", "other").optional(),

      birthday: Joi.string().optional(),
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  updateUser
)

router.route("/add-addresss").post(
  celebrate({
    body: Joi.object().keys({
      toName: Joi.string().required(),
      alternatePhone: Joi.string()
        .regex(/^[0-9]{8,15}$/)
        .required(),
      street: Joi.string().required(),
      suberb: Joi.string().required(),
      postCode: Joi.string()
        .regex(/^[0-9]{6}$/)
        .required(),
      lat: Joi.string().required(),
      long: Joi.string().required(),
      location: Joi.object().default({
        type: "Point",
        coordinates: [Number(78.088), Number(27.8974)],
      }),
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  addAddress
)

router.route("/update-address/:addressId").post(
  celebrate({
    body: Joi.object().keys({
      toName: Joi.string().optional(),
      alternatePhone: Joi.string()
        .regex(/^[0-9]{8,15}$/)
        .optional(),
      street: Joi.string().optional(),
      suberb: Joi.string().optional(),
      postCode: Joi.string()
        .regex(/^[0-9]{6}$/)
        .optional(),
      lat: Joi.string().optional(),
      long: Joi.string().optional(),
      location: Joi.object().default({
        type: "Point",
        coordinates: [Number(78.088), Number(27.8974)],
      }),
      isDefaultAddress: Joi.boolean().default(false),
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  updateAddress
)

router.route("/get-address").post(verifyJwt, getAddress)

router.route("/delete-address/:addressId").post(verifyJwt, removeAddress)

export default router
