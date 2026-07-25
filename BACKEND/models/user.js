// BACKEND/models/user.js
//
// WHAT:
// Defines the MongoDB structure for application users.
//
// WHY:
// Stores authentication and public profile information for each user.
//
// HOW:
// Each user is stored in the users collection.
//
// IMPORTANT:
// Passwords must never be stored directly.
// Only the secure password hash is stored in passwordHash.

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },

    passwordHash: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
    },

    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 180,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;