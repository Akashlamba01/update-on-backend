import jwt from "jsonwebtoken"
import ApiResponse from "../utils/api.responses.js"
import { config } from "../config/config.js"
import { User } from "../models/user.model.js"

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "")

    if (!token) return ApiResponse.unauthorized(res)

    const decode = jwt.verify(token, config.secretKeyJWT)
    console.log("decode data: ", decode)
    const user = await User.findOne({
      email: decode?.email,
      role: decode?.role,
    })

    if (!user) return ApiResponse.unknown(res, "Invalid token!")

    req.userData = decode
    next()
  } catch (error) {
    return ApiResponse.unauthorized(res, "User Unauthorized!")
  }
}

const decodeToken = (token) => {
  return jwt.verify(token, config.refreshSecretJWT)
}
export { verifyJwt, decodeToken }
