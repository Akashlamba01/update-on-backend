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
import {
  addAddress,
  getAddress,
  removeAddress,
  updateAddress,
} from "../../controllers/common.controller.js"

const router = express.Router()

router.route("/login").post(
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().lowercase().required(),
      password: Joi.string().required(),
      role: Joi.string().default("admin"),
      lat: Joi.string().optional(),
      long: Joi.string().optional(),
    }),
  }),
  loginUser
)

router.post(
  "/notificationManagement",
  celebrate({
    body: Joi.object().keys({
      deviceType: Joi.string().optional().valid("1", "2", "3"),
      role: Joi.string().valid("user", "agent", "merchant"),
      users: Joi.array().items(Joi.string()).default([]).optional(),
      heading: Joi.string().required(),
      message: Joi.string().required(),
    }),
  })
)

export default router
