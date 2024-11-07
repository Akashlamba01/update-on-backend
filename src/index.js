import dotenv from "dotenv"
dotenv.config({
  path: "../env",
})

import { config } from "./config/config.js"
import connectDB from "./db/index.js"
import { app } from "./app.js"

connectDB()
  .then(() => {
    console.log("Connection Connected!")
    app.listen(config.port, () => {
      console.log("Servier is running on the port: ", config.port)
    })
  })
  .catch((e) => {
    console.log("db not connected! Error: ", e)
  })
