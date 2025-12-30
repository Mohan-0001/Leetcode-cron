import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    lastSync: { type: Date, default: new Date(0) },

    // ✅ NEW
    earnedPOTDs: [
      {
        slug: String,
        date: String // YYYY-MM-DD
      }
    ]
  },
  { versionKey: false } // VERY IMPORTANT
);


export const User = mongoose.model("User", userSchema);