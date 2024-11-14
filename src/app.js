import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "./config/config.js"

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

// import userRoutes from "./routes/user.routes.js"
// app.use("/api/v1/users", userRoutes)

export { app }
