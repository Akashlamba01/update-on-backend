import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import { genratorToken } from "../utils/token.genrate.js"
import { compairCode, genratorOTP, hashCode } from "../utils/helper.js"
// import Sequence from "../models/sequence.handler.model.js"

const create = async (req, res) => {
  try {
    const { email, password, role } = req.body

    const user = await User.findOne({ email, role }).lean(true)

    if (user && user.isVerified) {
      return ApiResponse.taken(res, "User Already Exists!")
    }

    const accessToken = genratorToken.genratorAccessToken({ email, role })
    const OTP = genratorOTP()
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
      )
    } else {
      req.body.accessToken = accessToken
      req.body.verificationCode = verificationCode
      req.body.password = hashedPassword

      newUser = await User.create(req.body)
    }

    return ApiResponse.successCreate(res, { accessToken })
  } catch (error) {
    console.error(error)
    return ApiResponse.fail(res)
  }
}

const otpSend = async (req, res) => {
  try {
    // genrate otp
    // const OTP =
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
    )

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

    const accessToken = genratorToken.genratorAccessToken({ email, role })

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

export { create, otpSend, otpVerify, foretPassword }
