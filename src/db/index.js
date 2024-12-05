import mongoose from "mongoose"
import { DB_NAME } from "../constents.js"
import { config } from "../config/config.js"

const connectDB = async () => {
  try {
    // console.log(config.DB_URI, "db")
    const connectionInstence = await mongoose.connect(
      `${config.dbURILocal}/${DB_NAME}`
    )
    console.log("DB Conencted!!")
    // console.log(connectionInstence.connection.host)
  } catch (err) {
    console.log("MONGO DB Connection Error: ", err)
  }
}

export default connectDB
