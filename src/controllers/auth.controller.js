import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import { genratorToken } from "../utils/token.genrate.js"
import { genrateOtp } from "../utils/helper.js"
import Sequence from "../models/sequence.handler.model.js"

const create = async (req, res) => {
  try {
    let user = await User.findOne({
      email: req.body.email,
      role: req.body.role,
    }).lean(true)

    if (user && user.isVerified == true) {
      return ApiResponse.taken(res, "User Already Exists!")
    }

    req.body.accessToken = genratorToken.genratorAccessToken({ email })

    req.body.location = {
      type: "Point",
      coordinates: [Number(78.088), Number(27.8974)],
    }

    // genrateOtp
    const OTP = 123456

    //sendgrid service for mail send
    // mailService.sendMail(req.body.email, OTP);

    req.body.verificationCode = md5(OTP)
    req.body.password = md5(req.body.password)

    await Sequence.findOneAndUpdate(
      {},
      {
        $inc: { [req.body.role]: +1 },
      },
      { new: true }
    )

    let newUser = {}
    if (user && user.isVerified === false) {
      newUser = await User.findOneAndUpdate(
        {
          email: req.body.email,
          role: req.body.role,
        },
        req.body,
        {
          new: true,
        }
      )
    } else {
      newUser = await User.create(req.body)
    }

    return ApiResponse.successOk(res, newUser)
  } catch (error) {
    return ApiResponse.fail(res)
  }
}

const sendOtp = async (req, res) => {
  try {
    // genrate otp
    const OTP = 123456
    // sent to email

    const isUser = await User.findOneAndUpdate(
      {
        email: req.body.email,
        role: req.body.role,
      },
      {
        $set: {
          verificationCode: md5(OTP),
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
    return ApiResponse.fail(res)
  }
}

export { create, sendOtp }
