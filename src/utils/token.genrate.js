import { config } from "../config/config.js"
import jwt from "jsonwebtoken"

const genratorAccessToken = (user) => {
  const accessData = {
    _id: user._id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    email: user?.email,
    role: user?.role,
    phoneNumber: user?.phoneNumber,
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
