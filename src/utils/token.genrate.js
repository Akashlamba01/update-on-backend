import { config } from "../config/config.js"
import jwt from "jsonwebtoken"

const genratorAccessToken = (user) => {
  const accessData = {
    _id: user._id,
    role: user?.role,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    avatar: user?.avatar,
    gender: user?.gender,
    birthday: user?.birthday,
  }
  return jwt.sign(accessData, config.secretKeyJWT, {
    expiresIn: config.secretExpiryJWT,
  })
}

const genratorRefreshToken = (userId) => {
  return jwt.sign(
    {
      _id: userId,
    },
    config.refreshSecretJWT,
    {
      expiresIn: config.refreshSecretExpiryJWT,
    }
  )
}

export { genratorAccessToken, genratorRefreshToken }
