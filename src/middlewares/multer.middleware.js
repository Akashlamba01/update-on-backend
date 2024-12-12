import multer from "multer"
import fs from "fs"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./public/uploads/temp"
    fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extname = path.extname(file.originalname).toLowerCase()
    const filename = `${file.fieldname}-${uniqueSuffix}${extname}`
    cb(null, filename)
  },
})

// Multer file filter function
const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype
  if (!ALLOWED_FILE_TYPES.test(mimeType)) {
    const error = new Error("Invalid file type. Only image files are allowed.")
    error["statusCode"] = 400
    return cb(error, false)
  }
  cb(null, true)
}

// Initialize multer upload middleware with configuration
export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }, // Limit file size to prevent abuse
  fileFilter, // File type validation
}).single("image")
