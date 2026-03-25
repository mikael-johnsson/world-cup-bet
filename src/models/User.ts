import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: "user" | "admin";
  groupId?: mongoose.Types.ObjectId;
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
    // Group relation used for leaderboard visibility and group membership.
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      index: true,
    },
  },
  { timestamps: true },
);

export const User =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
