import mongoose from "mongoose"

const notificationsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "",
    },
    heading: {
      type: String,
      default: "",
    },
    sender: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

const Notification = mongoose.model("Notificaion", notificationsSchema)
export default Notification
