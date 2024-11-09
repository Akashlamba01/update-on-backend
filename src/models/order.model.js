import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    restaurent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurent",
    },
    amount: {
      type: Number,
      default: null,
    },
    deliveryMethod: {
      type: String,
      enum: ["onsite", "delevry"],
    },
    items: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cart",
    },
    // paymentDetails: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "payment"
    // },
    status: {
      type: String,
      enum: ["pending", "cooking", "collected", "canceled", "completed"],
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.model("Order", orderSchema)
export { Order }
