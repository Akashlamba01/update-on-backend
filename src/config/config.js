import dotenv from "dotenv"
dotenv.config()

export const config = {
  port: process.env.PORT || 8001,
  DB_URI: process.env.MONGODB_URI,
  dbURILocal: process.env.MONGODB_URI_LOCAL,
  corsOrigin: process.env.CORS_ORIGIN,

  secretKeyJWT: process.env.ACCESS_TOKEN_SECRET,
  secretExpiryJWT: process.env.ACCESS_TOKEN_EXPIRY,
  refreshSecretJWT: process.env.REFRESH_TOKEN_SECRET,
  refreshSecretExpiryJWT: process.env.REFRESH_TOKEN_EXPIRY,

  // cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  // cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  // cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  // cloudinaryUserAvatar: process.env.CLOUDINARY_USER_AVATAR,
  // cloudinaryUserCoverimg: process.env.CLOUDINARY_USER_COVER_IMG,
}
