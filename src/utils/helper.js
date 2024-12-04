import bcrypt from "bcrypt"
import admin from "firebase-admin"
import { config } from "../config/config.js"

const serviceAccount = JSON.parse(config.firebase)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const genratorOTP = () => {
  return 123456 //only for development mode
  // return Math.floor(100000 + Math.random() * 900000) // Generates a 6-digit number
}

const hashCode = async (txt) => {
  const saltRounds = 10 // Salt rounds for hashing
  if (typeof txt != "string") {
    txt = String(txt)
  }
  return await bcrypt.hash(txt, saltRounds)
}

const compairCode = async (txt, hashed) => {
  if (typeof txt != "string") {
    txt = String(txt)
  }
  return await bcrypt.compare(txt, hashed)
}

export { genratorOTP, hashCode, compairCode }
