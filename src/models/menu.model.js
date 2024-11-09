import mongoose from "mongoose"

const menuSchema = new mongoose.Schema(
  {
    restaurent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurent",
    },
    itemImg: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    ingredients: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: [1, 2, 3, 4, 5],
    },
    pericePerKcal: [
      {
        sizeName: String,
        price: Number,
        kcal: Number,
      },
    ],
    toppings: [
      {
        topping: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topping",
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const Menu = mongoose.model("Menu", menuSchema)
export { Menu }
