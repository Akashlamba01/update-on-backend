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

    // console.log("file url: ", result.url)
    fs.unlinkSync(localFilePath)
    return result
  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.log("errrrrr", error)
    return null
  }
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
