import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import {
  genratorAccessToken,
  genratorRefreshToken,
} from "../utils/token.genrate.js"
import { compairCode, genratorOTP, hashCode } from "../utils/helper.js"
// import Sesssion from "../models/session.model.js"
import { decodeToken } from "../middlewares/auth.middleware.js"
// import Sequence from "../models/sequence.handler.model.js"

//accessToken 15min
//refreshToken 30d

const createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body

    const user = await User.findOne({ email, role }).lean()

    if (user && user.isVerified) {
      return ApiResponse.taken(res, "User Already Exists!")
    }

    // const accessToken = genratorToken.genratorAccessToken(user)
    const OTP = genratorOTP()
    const verificationCode = await hashCode(OTP)
    const hashedPassword = await hashCode(password)

    let newUser = {}
    if (user && user.isVerified === false) {
      newUser = await User.findOneAndUpdate(
        { email, role },
        {
          $set: {
            // accessToken,
            verificationCode,
            password: hashedPassword,
          },
        },
        {
          new: true,
        }
      ).select("-password -verificationCode")
    } else {
      // req.body.accessToken = accessToken
      req.body.verificationCode = verificationCode
      req.body.password = hashedPassword

      newUser = await User.create(req.body)
      newUser.password = ""
      newUser.verificationCode = ""
    }

    return ApiResponse.successCreate(res, newUser)
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

const loginUser = async (req, res) => {
  try {
    const { password, email, role, deviceToken, deviceType, lat, long } =
      req.body
    const user = await User.findOne({ email, role })

    if (
      !user ||
      !(await compairCode(password, user.password)) ||
      !user.isVerified
    )
      return ApiResponse.unknown(res, "Invalid Credentials!")

    const refreshToken = genratorRefreshToken(user._id)

    user.location = {
      type: "Point",
      coordinates:
        lat && long
          ? [Number(lat), Number(long)]
          : [Number(user.lat), Number(user.long)],
    }
    user.refreshToken = refreshToken
    ;(user.deviceToken = deviceToken), (user.deviceType = deviceType)

    await user.save()

    const accessToken = genratorAccessToken(user)
    const options = {
      httpOnly: true,
      secure: true,
      // maxAge: 60 * 1000, // 1min
    }

    res.cookie("accessToken", accessToken, options)
    res.cookie("refreshToken", refreshToken, options)

    user.password = ""
    user.verificationCode = ""

    return ApiResponse.successAccepted(res, "User Login Successfully!", {
      user,
      tokens: { accessToken, refreshToken },
    })
  } catch (error) {
    console.log(error.message)
    return ApiResponse.fail(res)
  }
}

const logout = async (req, res) => {
  try {
    let data = await User.findByIdAndUpdate(
      req.userData._id,
      {
        refreshToken: "",
        deviceToken: null,
      },
      {
        new: true,
      }
    )
    if (!data) {
      return ApiResponse.unknown(res)
    }
    return ApiResponse.successOk(res, "User Loged Out Successfully!")
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

// not pefect
const tokenRefresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  try {
    if (!refreshToken)
      return ApiResponse.unauthorized(res, "Token is Required!")

    let decode = decodeToken(refreshToken)
    if (!decode) ApiResponse.unauthorized(res, "Invalid Refresh Token!")

    const newRefreshToken = genratorRefreshToken(decode._id)

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    })

    return ApiResponse.successOk(res, "Token Refresh Updated Successfully!", {
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    return ApiResponse.fail(res)
  }
}

const getUser = async (req, res) => {
  try {
    const userData = req.userData

    if (!userData) return ApiResponse.notFound(res, "User Not found!")

    return ApiResponse.successOk(res, "User Get Successfully!", {
      user: userData,
    })
  } catch (error) {
    // console.error("error: ", error)
    return ApiResponse.fail(res)
  }
}

const updateUser = async (req, res) => {
  try {
    const userData = req.userData
    const user = await User.findOne({
      email: userData.email,
      role: userData.role,
    }).lean()

    if (!user) return ApiResponse.notFound(res, "User Not Found!")

    if (!req.body.fullName) {
      req.body.fullName = req.body.firstName + " " + req.body.lastName
    }

    const isPhoneExits = await User.findOne({
      role: req.body.role,
      phoneNumber: req.body.phoneNumber,
      email: { $ne: userData.email },
    })

    if (isPhoneExits)
      return ApiResponse.taken(res, "Phone Number Already Exitst!")

    const refreshToken = genratorRefreshToken(user._id)
    req.body.refreshToken = refreshToken

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email, role: user.role },
      req.body,
      {
        new: true,
      }
    ).select("-password -verificationCode")

    const accessToken = genratorAccessToken(updatedUser)

    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 3600000, // Sets the expiration time in milliseconds (1 hour in this case)
    }

    res.cookie("accessToken", accessToken, options)
    res.cookie("refreshToken", refreshToken, options)

    return ApiResponse.successOk(res, "User Updated Successfully", updatedUser)
  } catch (error) {
    console.log(error.message)
    return ApiResponse.fail(res)
  }
}

const otpSend = async (req, res) => {
  try {
    // genrate otp
    const OTP = genratorOTP()
    const hashedCode = await hashCode(OTP)
    // sent to email

    const isUser = await User.findOneAndUpdate(
      {
        email: req.body.email,
        role: req.body.role,
      },
      {
        $set: {
          verificationCode: hashedCode,
        },
      },
      {
        new: true,
      }
    ).lean()

    if (!isUser) {
      return ApiResponse.notFound(res, "User Not Found!")
    }

    return ApiResponse.successOk(res, "OTP Sent Successfully!")
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

const otpVerify = async (req, res) => {
  try {
    const { email, OTP, role } = req.body
    const user = await User.findOne({ email, role }).lean()

    if (!user || !user.verificationCode) {
      return ApiResponse.unknown(res, "Invalid OTP!")
    }

    const isValidCode = await compairCode(OTP, user.verificationCode)

    if (!isValidCode) {
      return ApiResponse.unknown(res, "Invalid OTP!")
    }

    const accessToken = genratorAccessToken(user)

    await User.updateOne(
      { _id: user._id },
      { $set: { accessToken, verificationCode: "", isVerified: true } }
    )

    return ApiResponse.successOk(res, "Otp Verified Successfully!")
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

const forgetPassword = async (req, res) => {
  try {
    const { email, role, password } = req.body
    const user = await User.findOne({ email, role })

    if (!user || !user.isVerified)
      return ApiResponse.notFound(res, "User Not Found!")

    const newPassword = await hashCode(password)
    const refreshToken = genratorRefreshToken(user._id)

    const updatedUser = await User.findOneAndUpdate(
      { email, role },
      {
        $set: {
          password: newPassword,
          refreshToken: refreshToken,
        },
      },
      {
        new: true,
      }
    ).select("-password -verificationCode")

    return ApiResponse.successOk(
      res,
      "Password Reset Successfully!",
      updatedUser
    )
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

export {
  createUser,
  loginUser,
  logout,
  tokenRefresh,
  getUser,
  updateUser,
  otpSend,
  otpVerify,
  forgetPassword,
  loginSamp,
}
