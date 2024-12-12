import { v2 as cloudinary } from "cloudinary"
import { config } from "../config/config.js"

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

    console.log("file url: ", result.url)
    fs.unlinkSync(localFilePath)
    return result
  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.log("errrrrr", error)
    return null
  }
}

//
//
// s3 file
const uploadMedia = function (req, res, next) {
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: config.AWS_BUCKET.bucketName,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: "public-read",
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        })
      },
      key: function (req, file, cb) {
        let extArray = file.originalname.split(".")
        let extension = extArray[extArray.length - 1]

        cb(null, `images/${Date.now()}.` + extension)
      },
    }),
  })
  upload.single("media")(req, res, function (err, some) {
    if (err) {
      return resp.fail(res, "Image upload error :" + err.message)
    } else {
      return resp.success(res, "", {
        url: req.file.location,
      })
    }
  })
}

export { uploadOnCloudinary }

// const uploadResult = await cloudinary.uploader
//   .upload(
//     "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//     {
//       public_id: "shoes",
//     }
//   )
//   .catch((error) => {
//     console.log(error)
//   })
