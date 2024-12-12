import express from "express"
import { verifyJwt } from "../../middlewares/auth.middleware.js"
import { upload } from "../../middlewares/multer.middleware.js"
import { getProfile, uploadMedia } from "../../controllers/common.controller.js"
const router = express.Router()

router.route("/get-profile").get(verifyJwt, getProfile)

router.route("/upload-media").post(
  verifyJwt,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  uploadMedia
)

export default router
