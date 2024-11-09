import mongoose from "mongoose"

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      enum: ["drinks", "pizzas", "cakes", "burgers", "desserts"],
    },
    items: [{ type: ObjectId, ref: "Menu" }],
  },
  {
    timestamps: true,
  }
)

const Category = mongoose.model("", categorySchema)
export { Category }
