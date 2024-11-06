import mongoose from "mongoose"
import { DB_NAME } from "../constents.js"
import { config } from "../config/config.js"

const connectDB = () =>
  mongoose
    .connect(`${config.dbURILocal}/${DB_NAME}`)
    .then(() => {
      console.log("Connection Connected!")
    })
    .catch((e) => {
      console.log("db not connected! Error: ", e)
    })

export default connectDB
