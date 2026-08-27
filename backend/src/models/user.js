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
      trim: true,
      maxlength: 500
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

    credits: {
      type: Number,
      default: 10,
      min: 0
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