import { v2 as cloudinary } from "cloudinary"
import { config } from "../config/config.js"
import QRCode from "qrcode"
import streamifier from "streamifier"

import fs from "fs"

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret, // Click 'View API Keys' above to copy your API secret
})

const uploadOnCloudinary = async (localFilePath, uploadFolder) => {
  try {
    if (!localFilePath) return null

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: uploadFolder,
    })
    fs.unlinkSync(localFilePath)
    return result
  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.log("errrrrr", error)
    return null
  }
}

const generateQrCode = async (data) => {
  try {
    const base64 = await QRCode.toDataURL(data)
    const base64Data = Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    )
    const type = base64.split(";")[0].split("/")[1]
    const imageName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${type}`

    // Upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "qr_codes",
            public_id: imageName,
            overwrite: true,
            format: type, // Ensure the format matches the extracted type
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) return reject(error)
            resolve(result)
          }
        )
        streamifier.createReadStream(base64Data).pipe(uploadStream)
      })
    }

    const uploadResponse = await uploadToCloudinary()
    return uploadResponse.secure_url
  } catch (err) {
    console.error("ERROR MSG: ", err)
    throw err
  }
}

//
//
// s3 file
// const uploadMedia = function (req, res, next) {
//   const upload = multer({
//     storage: multerS3({
//       s3: s3,
//       bucket: config.AWS_BUCKET.bucketName,
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       acl: "public-read",
//       metadata: function (req, file, cb) {
//         cb(null, {
//           fieldName: file.fieldname,
//         })
//       },
//       key: function (req, file, cb) {
//         let extArray = file.originalname.split(".")
//         let extension = extArray[extArray.length - 1]

//         cb(null, `images/${Date.now()}.` + extension)
//       },
//     }),
//   })
//   upload.single("media")(req, res, function (err, some) {
//     if (err) {
//       return resp.fail(res, "Image upload error :" + err.message)
//     } else {
//       return resp.success(res, "", {
//         url: req.file.location,
//       })
//     }
//   })
// }

export { uploadOnCloudinary, generateQrCode }
