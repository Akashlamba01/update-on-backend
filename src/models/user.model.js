import mongoose from "mongoose"

const userScheme = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    diviceToken: {
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
    password: {
      type: String,
      default: "",
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
      },
    ],
    favoriteRestaurent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurent",
      },
    ],
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

const User = mongoose.model("User", userScheme)
await User.findOne({
  role: "admin",
}).then((res) => {
  if (!res) {
    User.create({
      email: "admin@gmail.com",
      password: "25d55ad283aa400af464c76d713c07ad", //12345678
      role: "admin",
      accessToken: jwt.sign(
        {
          email: "admin@gmail.com",
        },
        "supersecret"
      ),
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      isVerified: true,
    })
    User.create({
      email: "tester@gmail.com",
      password: "25d55ad283aa400af464c76d713c07ad", //12345678
      role: "admin",
      accessToken: jwt.sign(
        {
          email: "admin@gmail.com",
        },
        "supersecret"
      ),
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      isVerified: true,
    })
  }
})

export { User }
