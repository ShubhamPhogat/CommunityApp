import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  community: {
    type: String,
    ref: "Community",
    required: true,
  },
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    ref: "Role",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// compound index to ensure a user can only have one role in a community
memberSchema.index({ community: 1, user: 1 }, { unique: true });

export const Member = mongoose.model("Member", memberSchema);
