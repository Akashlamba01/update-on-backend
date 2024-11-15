import { config } from "../config/config.js"
import jwt from "jsonwebtoken"

const genratorToken = {
  genratorAccessToken: function (user) {
    return jwt.sign(user, config.secretKeyJWT, {
      expiresIn: config.secretExpiryJWT,
    })
  },

  genratorRefreshToken: function (userId) {
    return jwt.sign(
      {
        _id: userId,
      },
      config.refreshSecretJWT,
      {
        expiresIn: config.refreshSecretExpiryJWT,
      }
    )
  },
}

export { genratorToken }
