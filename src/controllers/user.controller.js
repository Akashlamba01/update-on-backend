import { Address } from "../models/address.model"
import ApiResponse from "../utils/api.responses"

// only for user
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

export { makeDefaultAddress }
