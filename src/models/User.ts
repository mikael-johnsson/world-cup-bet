import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: "user" | "admin";
  group: string;
  createdAt?: Date;
}

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    // Group controls which users are visible in the leaderboard.
    group: {
      type: String,
      required: true,
      default: "default",
      trim: true,
      lowercase: true,
      maxlength: 30,
      match: /^[a-z0-9 -]+$/,
    },
  },
  { timestamps: true },
);

export const User =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
