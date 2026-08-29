import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 101
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
      maxlength: 30
    },

    profilePhotoUrl: {
      type: String,
      trim: true
    },

    coverPhotoUrl: {
      type: String,
      trim: true
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ""
    },

    skillsCanTeach: {
      type: [String],
      default: []
    },

    skillsWantToLearn: {
      type: [String],
      default: []
    },

    skillLevel: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced"
      ],
      default: "beginner"
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },

    availability: {
      weekdayEvenings: { type: Boolean, default: true },
      weekendMornings: { type: Boolean, default: false },
      mode: { type: String, default: "Online Only" }
    },

    credits: {
      type: Number,
      default: 10,
      min: 0
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user"
    },

    status: {
      type: String,
      enum: ["active", "banned", "flagged"],
      default: "active"
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    refreshTokenHash: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({
  skillsCanTeach: 1
});

userSchema.index({
  skillsWantToLearn: 1
});

const User = mongoose.model(
  "User",
  userSchema
);

export default User;