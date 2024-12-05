import { Address } from "../models/address.model.js"
import ApiResponse from "../utils/api.responses.js"

const addAddress = async (req, res) => {
  try {
    const userId = req.userData._id
    const addresses = await Address.find({ user: userId })

    if (req.body.role !== "restaurent") {
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

const makeDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId

    const userAddress = await Address.findById(addressId)

    if (!userAddress) return ApiResponse.notFound(res, "Address not found!")

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

    userAddress.isDefaultAddress = true
    await userAddress.save()

    return ApiResponse.successOk(
      res,
      "Change Default Address Successfully!",
      userAddress
    )
  } catch (error) {
    return ApiResponse.fail(res, error.message)
  }
}

export { addAddress, updateAddress, getAddress, removeAddress }
