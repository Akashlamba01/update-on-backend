import bcrypt from "bcrypt"

const genratorOTP = () => {
  return Math.floor(100000 + Math.random() * 900000) // Generates a 6-digit number
}

const hashCode = async (txt) => {
  const saltRounds = 10 // Salt rounds for hashing
  return await bcrypt.hash(txt, saltRounds)
}

const compairCode = async (txt, hashed) => {
  return await bcrypt.compare(txt, hashed)
}

export { genratorOTP, hashCode, compairCode }
