import mongoose from "mongoose"

const addressSchema = new mongoose.Schema(
  {
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "user",
    // },
    toName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    suberb: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    userState: {
      type: String,
      default: "",
    },
    postCode: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDeliveryAddress: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const Address = mongoose.model("Address", addressSchema)
export { Address }
