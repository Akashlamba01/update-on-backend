import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    restaurent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurent",
    },
    grandTotal: { type: Number, default: null },
    totalItem: { type: Number, default: null },
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
        quantity: Number,
        itemTotoalPrice: Number,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
)

const Cart = mongoose.model("Cart", cartSchema)
export { Cart }
