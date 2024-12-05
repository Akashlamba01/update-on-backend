import bcrypt from "bcrypt"
import admin from "firebase-admin"
import { config } from "../config/config.js"
import Notification from "../models/notification.model.js"

// console.log("fir", config.firebase)
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

const sendNotification = async (
  users,
  heading,
  message,
  isSave,
  { type },
  sender
) => {
  const dbNotification = []
  const notificationPayloads = []

  users.forEach((user) => {
    const notificationPayload = {
      token: user.deviceToken, // Common for all platforms
      notification: {
        title: heading, // Title of the notification
        body: message, // Body content of the notification
      },
      data: {
        type: type, // Type of notification (used for app logic)
        sender: sender, // Who is sending the notification
      },
    }

    if (user.deviceType === 1) {
      // Android-specific
      notificationPayload.data.android_channel_id = "all" // Required for Android 8+
      notificationPayload.data.priority = "high"
    } else if (user.deviceType === 2) {
      // iOS-specific
      notificationPayload.notification.sound = "default"
      notificationPayload.apns = {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
          },
        },
      }
    } else if (user.deviceType === 3) {
      // Web-specific
      notificationPayload.webpush = {
        notification: {
          icon: "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg",
          click_action: "https://yourwebsite.com",
        },
      }
    }

    notificationPayloads.push(notificationPayload)
    dbNotification.push({
      user: user._id,
      message: message,
      heading: heading,
      sender: sender,
    })
  })

  try {
    const response = await admin.messaging().sendAll(notificationPayloads)
    console.log(`${response.successCount} notifications sent successfully.`)

    if (response.failureCount > 0) {
      console.error(
        "Failed notifications:",
        response.responses.filter((r) => !r.success)
      )
    }

    if (isSave) {
      await Notification.insertMany(dbNotification)
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}

export { genratorOTP, hashCode, compairCode, sendNotification }
