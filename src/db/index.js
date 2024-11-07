import mongoose from "mongoose"
import { DB_NAME } from "../constents.js"
import { config } from "../config/config.js"

const connectDB = async () => {
  await mongoose.connect(`${config.dbURILocal}/${DB_NAME}`)
}

export default connectDB
