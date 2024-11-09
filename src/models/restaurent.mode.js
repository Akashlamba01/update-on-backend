import mongoose from "mongoose"

const restaurentSchema = new mongoose.Schema(
  {
    restaurentName: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    restroType: {
      type: "String",
      enum: ["Vertual Kitchen", "Physical Restraurent"],
    },
    email: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    restaurentGallery: [
      {
        type: String,
        default: "",
      },
    ],
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
      },
    ],
    website: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: [Number],
      default: [0, 0],
    },
    lat: {
      type: String,
      default: "",
    },
    long: {
      type: String,
      default: "",
    },
    alwaysOnpen: {
      type: String,
      default: false,
    },
    timing: [
      {
        openingTime: String,
        closingTime: String,
        days: {
          type: String,
          enum: [
            "all",
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
        },
        isChecked: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Restaurent = mongoose.model("Restaurent", restaurentSchema)
export { Restaurent }
