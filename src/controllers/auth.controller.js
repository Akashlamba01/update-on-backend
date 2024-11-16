import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import { genratorToken } from "../utils/token.genrate.js"
import { compairCode, genratorOTP, hashCode } from "../utils/helper.js"
// import Sequence from "../models/sequence.handler.model.js"

const create = async (req, res) => {
  try {
    const { email, password, role } = req.body

    const user = await User.findOne({ email, role }).lean()

    if (user && user.isVerified) {
      return ApiResponse.taken(res, "User Already Exists!")
    }

    const accessToken = genratorToken.genratorAccessToken(user)
    const OTP = genratorOTP()
    console.log("OPT", OTP)
    const verificationCode = await hashCode(OTP)
    const hashedPassword = await hashCode(password)

    let newUser = {}
    if (user && user.isVerified === false) {
      newUser = await User.updateOne(
        { email, role },
        {
          $set: {
            accessToken,
            verificationCode,
            password: hashedPassword,
          },
        },
        {
          new: true,
        }
      ).select("-password -verificationCode")
    } else {
      req.body.accessToken = accessToken
      req.body.verificationCode = verificationCode
      req.body.password = hashedPassword

      newUser = await User.create(req.body).select(
        "-password -verificationCode"
      )
    }

    return ApiResponse.successCreate(res, { user: newUser })
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

const login = async (req, res) => {
  try {
    const { password, email, role } = req.body
    const user = await User.findOne({ email, role }).select(
      "-password -verificationCode"
    )

    if (!user || !hashCode(password, user.password))
      return ApiResponse.unknown(res, "Invalid Credentials!")

    const accessToken = genratorToken.genratorAccessToken(user)
    const refreshToken = genratorToken.genratorRefreshToken(user._id)

    const options = {
      httpOnly: true,
      secure: true,
      // maxLen: 360000
    }

    res.cookie("accessToken", accessToken, options)
    res.cookie("refreshToken", refreshToken, options)

    return ApiResponse.successAccepted(res, "User Login Successfully!", user)
  } catch (error) {
    return ApiResponse.fail(res)
  }
}

const read = async (req, res) => {
  try {
    const userData = req.userData

    if (!userData) return ApiResponse.notFound(res, "User Not found!")

    return ApiResponse.successOk(res, "User Get Successfully!", userData)
  } catch (error) {
    // console.error("error: ", error)
    return ApiResponse.fail(res)
  }
}

const update = async (req, res) => {
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

    // req.body.refreshToken = genratorToken.genratorRefreshToken(user._id)

    const updatedUser = await User.updateOne(
      { email: user.email, role: user.role },
      req.body,
      {
        new: true,
      }
    ).select("-password -verificationCode")

    const accessToken = genratorToken.genratorAccessToken(updatedUser)
    const refreshToken = genratorToken.genratorRefreshToken(updatedUser._id)

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
    // const OTP =
    const OTP = genratorOTP()
    console.log("OPT: ", OTP)
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

    const accessToken = genratorToken.genratorAccessToken(user)

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

const foretPassword = async (req, res) => {
  try {
    const { email, role, password } = req.body
    const user = await User.findOne({ email, role }).lean()

    if (!user || !user.isVerified)
      return ApiResponse.notFound(res, "User Not Found!")

    const newPassword = await hashCode(password)
    const accessToken = genratorToken({ email, role })

    await User.updateOne(
      { _id: user._id },
      { $set: { password: newPassword, accessToken } },
      { new: true }
    )

    return ApiResponse.successOk(res, "Password Reset Successfully!", {
      accessToken,
    })
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

export { create, login, read, update, otpSend, otpVerify, foretPassword }
