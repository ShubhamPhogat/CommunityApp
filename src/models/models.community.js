import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    maxlength: 128,
    required: true,
  },
  slug: {
    type: String,
    maxlength: 255,
    unique: true,
    required: true,
  },
  owner: {
    type: String,
    ref: "User",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export const Community = mongoose.model("Community", communitySchema);
