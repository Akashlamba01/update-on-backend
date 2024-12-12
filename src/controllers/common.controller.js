import { config } from "../config/config.js"
import { cookieOptions } from "../constents.js"
import { Address } from "../models/address.model.js"
import { User } from "../models/user.model.js"
import ApiResponse from "../utils/api.responses.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { genratorAccessToken } from "../utils/token.genrate.js"

const getProfile = async (req, res) => {
  try {
    const userData = req.userData

    if (!userData) return ApiResponse.notFound(res, "User Not found!")

    return ApiResponse.successOk(res, "User Get Successfully!", {
      user: userData,
    })
  } catch (error) {
    // console.error("error: ", error)
    return ApiResponse.fail(res)
  }
}

const addAddress = async (req, res) => {
  try {
    const userId = req.userData._id
    const addresses = await Address.find({ user: userId })

    if (req.userData.role !== "restaurent") {
      if (addresses.length >= 5) {
        return ApiResponse.fail(res, "Please Delete Any One Address!")
      }
    }

    if (!addresses.length) {
      req.body.isDefaultAddress = true
    }

    const newAddress = await Address.create(req.body)
    if (!newAddress) return ApiResponse.fail(res)

    return ApiResponse.successCreate(
      res,
      "Address Created Successfully!",
      newAddress
    )
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId
    const userAddress = await Address.findById(addressId)

    if (!userAddress) return ApiResponse.notFound(res, "Address not found!")

    if (req.body.isDefaultAddress) {
      await Address.findOneAndUpdate(
        {
          user: req.userData._id,
          isDefaultAddress: true,
        },
        {
          $set: {
            isDefaultAddress: false,
          },
        }
      ).lean()
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      req.body,
      {
        new: true,
      }
    ).lean()

    return ApiResponse.successOk(
      res,
      "Address Updated Successfully!",
      updatedAddress
    )
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

const getAddress = async (req, res) => {
  try {
    const userAddress = await Address.find({ user: req.userData._id })

    if (!userAddress.length)
      return ApiResponse.notFound(res, "Address not found!")

    return ApiResponse.successOk(res, "Address Get Successfully!", userAddress)
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

const removeAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId
    const userAddress = await Address.findById(addressId)

    if (!userAddress) return ApiResponse.notFound(res, "Address not found!")

    if (userAddress.length >= 2 && userAddress.isDefaultAddress) {
      return ApiResponse.unauthorized(
        res,
        "This is your Default Address Please chenge it!"
      )
    }

    await Address.findByIdAndDelete(addressId)

    return ApiResponse.successOk(res, "Address Deleted Successfully!")
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

// media upload
const uploadMedia = async (req, res) => {
  try {
    const avatarLoaclPath = req?.files?.avatar
      ? req.files.avatar[0]?.path
      : null
    const coverImageLocalPath = req?.files?.coverImage
      ? req.files.coverImage[0]?.path
      : null

    if (!avatarLoaclPath && !coverImageLocalPath)
      return ApiResponse.fail(res, "At least one upload field is required!")

    if (avatarLoaclPath && coverImageLocalPath)
      return ApiResponse.fail(
        res,
        "Please upload either avatar or cover image, not both!"
      )

    const user = await User.findOne({
      email: req.userData.email,
      role: req.userData.role,
    }).select("-password -verificationCode")
    if (!user) return ApiResponse.notFound(res, "User Not Found!")

    if (avatarLoaclPath) {
      const avatar = await uploadOnCloudinary(
        avatarLoaclPath,
        config.cloudinaryUserAvatar
      )
      user.avatar = avatar.url
    }
    if (coverImageLocalPath) {
      const coverImage = await uploadOnCloudinary(
        coverImageLocalPath,
        config.cloudinaryUserCoverimg
      )
      user.coverImage = coverImage.url
    }
    await user.save()

    const accessToken = genratorAccessToken(user)
    res.cookie("accessToken", accessToken, cookieOptions)

    return ApiResponse.successOk(res, "Media Updated Successfully!")
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

export {
  getProfile,
  addAddress,
  updateAddress,
  getAddress,
  removeAddress,
  uploadMedia,
}
