import mongoose, { Document, Schema } from "mongoose";

export interface GroupDocument extends Document {
  name: string;
  passwordHash: string;
  users: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const groupSchema = new Schema(
  {
    // Group names should be unique so users can reliably find a group to join.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    // We store only a hash, never a plain password.
    passwordHash: {
      type: String,
      required: true,
    },
    // Group members are stored as user references.
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true },
);

export const Group =
  mongoose.models.Group || mongoose.model<GroupDocument>("Group", groupSchema);
