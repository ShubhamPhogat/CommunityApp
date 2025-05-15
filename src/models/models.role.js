import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    maxlength: 64,
    unique: true,
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

export const Role = mongoose.model("Role", roleSchema);
