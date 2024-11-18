import express from "express"
import { Joi, celebrate } from "celebrate"
import {
  otpVerify,
  otpSend,
  createUser,
  loginUser,
  getUser,
  updateUser,
  forgetPassword,
  tokenRefresh,
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
  createUser
)

router.route("/login").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      role: Joi.string().default("user"),
      password: Joi.string().required(),
      lat: Joi.string().optional(),
      long: Joi.string().optional(),
    }),
  }),
  loginUser
)

router.route("/get-profile").get(
  celebrate({
    body: Joi.object().keys({
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  getUser
)

router.route("/update-profile").post(
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string().lowercase().optional(),
      lastName: Joi.string().lowercase().optional(),
      fullName: Joi.string().lowercase().optional(),
      phoneNumber: Joi.string()
        .regex(/^[0-9]{8,15}$/)
        .optional(),
      gender: Joi.string().valid("male", "female", "other"),
      birthday: Joi.string().optional(),
      role: Joi.string().default("user"),
    }),
  }),
  verifyJwt,
  updateUser
)

//pending
router.route("/refresh-token").post(
  celebrate({
    body: Joi.object().keys({
      role: Joi.string().default("user"),
    }),
  }),
  // verifyJwt,
  tokenRefresh
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

// router.route("/delete").post(async (req, res) => {
//   try {
//     const deleteData = await User.deleteMany({ isVerified: false })
//     return ApiResponse.successAccepted(res, "deleted", deleteData)
//   } catch (error) {
//     return ApiResponse.fail(res)
//   }
// })

export default router
