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

const sendNotification = async (
  users,
  heading,
  message,
  isCreate,
  { type },
  sender
) => {
  await admin.messaging().sendEach()
  users.map((user) => {
    // let notificationPayload = {
    //   1: {
    //     // Android payload
    //     to: user.deviceToken,
    //     data: {
    //       title: heading,
    //       body: message,
    //       sound: "space",
    //       android_channel_id: "all",
    //       priority: "high",
    //       type: type,
    //       sender: sender,
    //     },
    //     priority: "high",
    //   },
    //   2: {
    //     // iOS payload
    //     to: user.deviceToken,
    //     notification: {
    //       title: heading,
    //       body: message,
    //       type: type,
    //       sender: sender,
    //     },
    //     sound: "default",
    //   },
    //   3: {
    //     // Web payload
    //     to: user.deviceToken,
    //     webpush: {
    //       notification: {
    //         title: heading,
    //         body: message,
    //         icon: "https://example.com/icon.png", // Replace with your notification icon URL
    //         actions: [
    //           {
    //             action: "open_url", // Action identifier
    //             title: "View Details", // Action title
    //           },
    //         ],
    //       },
    //       fcm_options: {
    //         link: "https://example.com", // URL to open when the notification is clicked
    //       },
    //     },
    //   },
    // }

    let notificationPayload = {
      1: {
        // Android payload
        notification: {
          title: heading, // Title of the notification
          body: message, // Body content of the notification
          sound: "default", // For iOS/Android, adjust as needed for platform-specific sound
        },
        data: {
          type: type, // Type of notification (used for app logic)
          sender: sender, // Who is sending the notification
          android_channel_id: "all", // Android-specific channel ID (for Android notifications)
          priority: "high",
          // Additional custom fields you can use for data:
          // customField1: "customValue1",
          // customField2: "customValue2",
        },
        tokens: [user.deviceToken],
      },
      2: {
        notification: {
          title: title,
          body: message,
          sound: "default",
          bedge: 1,
        },
        data: {
          type: type,
          sender: sender,
          priority: "high",
        },
        tokens: [user.deviceToken],
      },
      3: {
        // Web payload
        notification: {
          title: heading,
          body: message,
          icon: "https://example.com/icon.png", // Replace with your notification icon URL
          click_action: "https://yourwebsite.com",
        },
        data: {
          type: type,
          sender: sender,
        },
        tokens: [user.deviceToken],
      },
    }
  })
}

export { genratorOTP, hashCode, compairCode }
