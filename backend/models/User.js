import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: String, 
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  lastSync: { type: Date, default: 1767022200000 }
});

export const User = mongoose.model("User", userSchema);