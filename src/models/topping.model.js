import mongoose from "mongoose"

const toppingSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menu",
    },
    name: String,
    price: {
      type: Number,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const Topping = mongoose.model("Topping", toppingSchema)
export { Topping }
