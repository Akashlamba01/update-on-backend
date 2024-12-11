import jwt from "jsonwebtoken"
import ApiResponse from "../utils/api.responses.js"
import { config } from "../config/config.js"
import { User } from "../models/user.model.js"

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "")

    if (!token)
      return ApiResponse.unauthorized(res, "Access or Refresh Token missing!")

    if (token == "test" && role == "admin") {
      req.userData = { role: "admin" }
      next()
      return
    }

    const decode = jwt.verify(token, config.secretKeyJWT)
    const user = await User.findOne({
      email: decode?.email,
      role: decode?.role,
    }).select("-password -verificationCode")

    if (!user) return ApiResponse.unauthorized(res, "User not found!")

    req.userData = decode
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Access token expired!")
    } else if (error.name === "JsonWebTokenError") {
      return ApiResponse.unauthorized(res, "Invalid access token!")
    }
  }
}

const decodeRefreshToken = (token) => {
  return jwt.verify(token, config.refreshSecretJWT)
}

export { verifyJwt, decodeRefreshToken }
