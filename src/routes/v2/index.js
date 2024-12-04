import express from "express"
import userRoute from "./user.route.js"
import adminRoute from "./admin.route.js"
const router = express.Router()

router.use("/users", userRoute)
router.use("/admin", adminRoute)

export default router
