const mongoose = require("mongoose")
const sequenceSchema = new mongoose.Schema(
  {
    user: {
      type: Number,
      default: 0,
    },
    shipper: {
      type: Number,
      default: 0,
    },
    restaurant: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Sequence = mongoose.model("SequenceHandler", sequenceSchema)

Sequence.findOne({}).then((res) => {
  if (!res)
    Sequence.create({
      user: 0,
      shipper: 0,
      restaurant: 0,
    })
})
module.exports = Sequence
