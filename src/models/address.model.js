import mongoose from "mongoose"

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    toName: {
      type: String,
      default: "",
    },
    // deliveryMethod: {
    //   type: String,
    //   enum: ["shipper", "onsite"],
    // },
    restaurantName: {
      type: String,
      default: "",
    },
    restaurantType: {
      type: String,
      enum: ["vertual", "physical"],
    },
    restaurantEmail: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "+61",
    },
    alternatePhone: {
      type: String,
    },
    street: {
      type: String,
      default: "",
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
    website: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isDefaultAddress: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

addressSchema.index({ user: 1 })

const Address = mongoose.model("Address", addressSchema)
export { Address }
