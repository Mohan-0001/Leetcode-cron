import mongoose from "mongoose";

const earnedSchema = new mongoose.Schema({
  date: String,        // YYYY-MM-DD
  slug: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  earnedPOTDs: { type: [earnedSchema], default: [] },
  lastSync: { type: Date, default: new Date(0) }
});

export const User = mongoose.model("User", userSchema);
