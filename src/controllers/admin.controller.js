import { cookieOptions } from "../constents.js"
import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import { compairCode, sendNotification } from "../utils/helper.js"
import {
  genratorAccessToken,
  genratorRefreshToken,
} from "../utils/token.genrate.js"

const login = async (req, res) => {
  try {
    let user = await User.findOne({
      email: req.body.email,
      role: req.body.role,
    })

    if (
      !user ||
      !(await compairCode(req.body.password, user.password)) ||
      !user.isVerified
    ) {
      return ApiResponse.unknown(res, "Invalid Credentials!")
    }

    const refreshToken = genratorRefreshToken(user._id)
    const accessToken = genratorAccessToken(user)

    res.cookie("accessToken", accessToken, cookieOptions)
    res.cookie("refreshToken", refreshToken, cookieOptions)

    user.password = ""
    user.verificationCode = ""

    return ApiResponse.successAccepted(res, "User Login Successfully!", {
      user,
      tokens: { accessToken, refreshToken },
    })
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

const notificationToAll = async (req, res) => {
  try {
    let query = {}
    if (req.body.deviceType) {
      query.deviceType = req.body.deviceType
    }
    if (req.body.role) {
      query.role = req.body.role
    }
    if (!req.body.users.length > 0) {
      req.body.users = await User.find(query).sort({ _id: -1 }).lean(true)
    }

    console.log(req.body.users)

    await sendNotification(
      req.body.users,
      req.body.heading,
      req.body.message,
      false,
      {}
    )

    return ApiResponse.successOk(res, "Notification Sent Successfully!")
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

export { login, notificationToAll }
