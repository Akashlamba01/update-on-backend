import mongoose from "mongoose"

const sponsorshipSchema = new mongoose.Schema(
  {
    restaurent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurent",
    },
    packege: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: false,
    },
    // payment: {
    //   type: String,
    //   default: "",
    // },
    sponsorImg: {
      type: String,
      default: "", // logo form restro img as default
    },
  },
  { timestamps: true }
)

const Sponsorship = mongoose.model("Sponsorship", sponsorshipSchema)
export { Sponsorship }
