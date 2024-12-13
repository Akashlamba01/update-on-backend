import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import {
  genratorAccessToken,
  genratorRefreshToken,
} from "../utils/token.genrate.js"
import { compairCode, genratorOTP, hashCode } from "../utils/helper.js"
// import Sesssion from "../models/session.model.js"
import { decodeRefreshToken } from "../middlewares/auth.middleware.js"
import { cookieOptions } from "../constents.js"
import { generateQrCode } from "../utils/cloudinary.js"

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

    res.cookie("accessToken", accessToken, cookieOptions)
    res.cookie("refreshToken", refreshToken, cookieOptions)

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

    res.clearCookie(refreshToken, cookieOptions)
    res.clearcookie(accessToken, cookieOptions)

    return ApiResponse.successOk(res, "User Loged Out Successfully!")
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

const tokenRefresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken
  if (!refreshToken) return ApiResponse.unauthorized(res, "Token is Required!")

  try {
    const decode = decodeRefreshToken(refreshToken)
    if (!decode) ApiResponse.unauthorized(res, "Invalid Refresh Token!")

    const user = await User.findById(decode._id)

    if (!user || user.refreshToken != refreshToken)
      return ApiResponse.unauthorized(res, "User Not Found!")

    const newRefreshToken = genratorRefreshToken(decode._id)
    const accessToken = genratorAccessToken(user)

    res.cookie("refreshToken", newRefreshToken, cookieOptions)
    res.cookie("accessToken", accessToken, cookieOptions)

    return ApiResponse.successOk(res, "Token Refresh Updated Successfully!", {
      refreshToken: newRefreshToken,
      accessToken,
    })
  } catch (error) {
    return ApiResponse.fail(res, error.message || "Invalid Refresh Token!")
  }
}

const updateUser = async (req, res) => {
  try {
    const userData = req.userData
    const user = await User.findOne({
      email: userData.email,
      role: userData.role,
    })

    if (!user) return ApiResponse.notFound(res, "User Not Found!")

    if (!req.body.fullName) {
      req.body.fullName = `${req.body.firstName || user.firstName} ${req.body.lastName || user.lastName}`
    }

    if (req.body.phoneNumber) {
      const isPhoneExits = await User.findOne({
        role: req.body.role,
        phoneNumber: req.body.phoneNumber,
        email: { $ne: userData.email },
      })
      if (isPhoneExits)
        return ApiResponse.taken(res, "Phone Number Already Exitst!")
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email, role: user.role },
      req.body,
      {
        new: true,
        select: "-password -verificationCode",
      }
    )

    if (!updatedUser) return ApiResponse.fail(res, "Failed to update user!")

    const accessToken = genratorAccessToken(updatedUser)
    res.cookie("accessToken", accessToken, cookieOptions)

    return ApiResponse.successOk(res, "User Updated Successfully", updatedUser)
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

const qrCodeGenrate = async (req, res) => {
  try {
    const qrCodeUrl = await generateQrCode(
      "https://www.linkedin.com/in/rajan-lamba-750451289/"
    )

    return ApiResponse.successOk(res, "QR Code Uploaded Successfully!", {
      url: qrCodeUrl,
    })
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

export {
  createUser,
  otpSend,
  otpVerify,
  forgetPassword,
  loginUser,
  logout,
  tokenRefresh,
  updateUser,
  qrCodeGenrate,
}
