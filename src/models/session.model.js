import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" },
})

const Sesssion = mongoose.model("Session", sessionSchema)
export default Sesssion
