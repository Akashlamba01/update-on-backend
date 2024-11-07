import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "../src/config/config.js"

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

export { app }
