import mongoose from "mongoose"
import { hashCode } from "../utils/helper.js"

const userScheme = new mongoose.Schema(
  {
    // accessToken: {
    //   type: String,
    //   default: "",
    // },
    refreshToken: {
      type: String,
      default: "",
    },
    deviceToken: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    birthday: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    lat: { type: String, default: "27.8974" },
    long: { type: String, default: "78.0880" },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: [Number],
      default: [0, 0],
    },
    password: {
      type: String,
      default: "",
    },
    // address: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "address",
    //   },
    // ],
    favoriteRestaurent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurent",
      },
    ],
    //     *
    // Restaurant type
    // Restaurant email

    role: {
      type: String,
      enum: ["user", "restaurent", "shipper", "admin"],
    },
    referralCode: {
      type: String,
      default: "",
    },
    verificationCode: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deviceType: {
      type: Number,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isRestaurentOwner: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

userScheme.index({ email: 1, role: 1 })

const User = mongoose.model("User", userScheme)
User.findOne({
  role: "admin",
}).then(async (res) => {
  if (!res) {
    await User.create({
      email: "admin@gmail.com",
      password: await hashCode(12345678), //12345678
      role: "admin",
      // accessToken: genratorAccessToken(),
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      isVerified: true,
    })
    await User.create({
      email: "tester@gmail.com",
      password: await hashCode(12345678), //12345678
      role: "admin",
      // accessToken: genratorAccessToken({ email }),
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      isVerified: true,
    })
  }
})

export { User }
