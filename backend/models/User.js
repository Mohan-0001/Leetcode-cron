import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  displayName: String, 
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  lastSync: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);