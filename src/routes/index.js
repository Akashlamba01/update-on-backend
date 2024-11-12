import { Router } from "express"
import indexRoute from "./v2/index.js"
const router = Router()

router.use("/v2", indexRoute)

export default router
