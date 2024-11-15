function genrateOtp(len) {
  let otp = ""
  let digits = "0123456789"

  while (otp.length <= len) {
    otp += digits[Math.floor(Math.random() * 10)]
  }
  return Number(otp)
}

export { genrateOtp }
