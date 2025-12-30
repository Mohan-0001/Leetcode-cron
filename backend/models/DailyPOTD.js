import mongoose from "mongoose";

const potdSchema = new mongoose.Schema({
  date: { type: String, unique: true }, // YYYY-MM-DD
  problems: [String],                   // titleSlug[]
  startTime: Date,
  endTime: Date
});

export const DailyPOTD = mongoose.model("DailyPOTD", potdSchema);
