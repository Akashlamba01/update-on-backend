import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "./config/config.js"
import mainRoutes from "./routes/index.js"
import { errors } from "celebrate"

const app = express()

app.use(
  cors({
    origin: config.corsOrigin,
  })
)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("empty"))
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello, Node.js and MongoDB!")
})

app.use("/api", mainRoutes)
// import userRoutes from "./routes/user.routes.js"
// app.use("/api/v1/users", userRoutes)

// to find the device
// app.get("/get-devicetype", (req, res) => {
//   const userAgent = req.get("User-Agent")
//   // console.log(userAgent)
//   if (userAgent) {
//     if (/android/i.test(userAgent)) {
//       req.deviceType = "Android"
//     } else if (/iphone|ipod/i.test(userAgent)) {
//       req.deviceType = "iOS"
//     } else if (/web/i.test(userAgent)) {
//       req.deviceType = "Web"
//     } else {
//       req.deviceType = "Unknown"
//     }
//   }
//   return res.status(200).json({
//     message: "success",
//     device: req.deviceType,
//   })
// })

app.use(errors())

export { app }
