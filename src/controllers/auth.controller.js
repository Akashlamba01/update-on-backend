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
    const { password, email, role, lat, long } = req.body
    const user = await User.findOne({ email, role })

    if (
      !user ||
      !(await compairCode(password, user.password)) ||
      !user.isVerified
    )
      return ApiResponse.unknown(res, "Invalid Credentials!")

    user.location = {
      type: "Point",
      coordinates:
        req.body.lat && req.body.long
          ? [Number(lat), Number(long)]
          : [Number(user.lat), Number(user.long)],
    }
    await user.save()

    const accessToken = genratorAccessToken(user)
    const refreshToken = genratorRefreshToken(user._id)

    const options = {
      httpOnly: true,
      secure: true,
      // maxLen: 360000
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

const tokenRefresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  try {
    if (!refreshToken)
      return ApiResponse.unauthorized(res, "Token is Required!")

    let decode = decodeToken(refreshToken)
    if (!decode) ApiResponse.unauthorized(res, "Invalid Refresh Token!")

    const newRefreshToken = genratorRefreshToken(decode._id)

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
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

    // req.body.refreshToken = genratorRefreshToken(user._id)

    const updatedUser = await User.updateOne(
      { email: user.email, role: user.role },
      req.body,
      {
        new: true,
      }
    ).select("-password -verificationCode")

    const accessToken = genratorAccessToken(updatedUser)
    const refreshToken = genratorRefreshToken(updatedUser._id)

    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 3600000, // Sets the expiration time in milliseconds (1 hour in this case)
    }

    res.cookie("accessToken", accessToken, options)
    res.cookie("refreshToken", refreshToken, options)

    return ApiResponse.successOk(res, "User Updated Successfully", updatedUser)
  } catch (error) {
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
    const user = await User.findOne({ email, role }).lean()

    if (!user || !user.isVerified)
      return ApiResponse.notFound(res, "User Not Found!")

    const newPassword = await hashCode(password)
    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.userData._id },
      { $set: { password: newPassword } },
      { new: true }
    )

    // await Sesssion.deleteMany({ userId: user._id })

    // const accessToken = genratorAccessToken(user)
    // const refreshToken = genratorRefreshToken(user._id)
    // res.clearCookie("accessToken")
    // res.clearCookie("refreshToken")

    return ApiResponse.successOk(res, "Password Reset Successfully!")
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

export {
  createUser,
  loginUser,
  tokenRefresh,
  getUser,
  updateUser,
  otpSend,
  otpVerify,
  forgetPassword,
}
