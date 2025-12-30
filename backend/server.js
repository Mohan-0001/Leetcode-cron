// const startServer = async () => {
//   try {
//     await connectDB();

//     await User.insertMany(users, { ordered: false });
//     console.log("✅ Users inserted successfully");

//     app.listen(process.env.PORT || 5000, () => {
//       console.log("🚀 Server started");
//     });
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// };

// startServer();






import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import { User } from "./models/User.js";
import { DailyPOTD } from "./models/DailyPOTD.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

/* --------------------------------- HELPERS -------------------------------- */

const getHeaders = () => ({
  Referer: "https://leetcode.com",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0"
});

const todayKey = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

/* ----------------------------- ADMIN: SET POTD ----------------------------- */
/**
 * POST /api/admin/potd
 * body: { problems: ["slug1", "slug2"] }
 */
app.post("/api/admin/potd", async (req, res) => {
  const { problems } = req.body;
  if (!Array.isArray(problems) || !problems.length) {
    return res.status(400).json({ error: "Problems required" });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 86400000);

  const potd = await DailyPOTD.findOneAndUpdate(
    { date: todayKey() },
    { problems, startTime: start, endTime: end },
    { upsert: true, new: true }
  );

  res.json({ message: "POTD set", potd });
});

/* --------------------------- SYNC SINGLE USER ------------------------------- */
async function syncUser(username, potd) {
  const query = `
    query($username: String!) {
      matchedUser(username: $username) {
        submitStats { acSubmissionNum { difficulty count } }
      }
      recentSubmissionList(username: $username, limit: 50) {
        titleSlug timestamp statusDisplay
      }
    }
  `;

  const res = await axios.post(
    "https://leetcode.com/graphql",
    { query, variables: { username } },
    { headers: getHeaders(), timeout: 10000 }
  );

  const data = res.data.data;
  if (!data?.matchedUser) return null;

  const user = await User.findOne({ username });
  let earnedToday = 0;

  for (const sub of data.recentSubmissionList) {
    const subTime = Number(sub.timestamp) * 1000;

    if (
      sub.statusDisplay === "Accepted" &&
      potd.problems.includes(sub.titleSlug) &&
      subTime >= potd.startTime &&
      subTime < potd.endTime &&
      !user.earnedPOTDs.some(
        e => e.slug === sub.titleSlug && e.date === potd.date
      )
    ) {
      user.earnedPOTDs.push({ slug: sub.titleSlug, date: potd.date });
      earnedToday += 10;
    }
  }

  const stats = data.matchedUser.submitStats.acSubmissionNum;
  user.easy = stats.find(s => s.difficulty === "Easy")?.count || 0;
  user.medium = stats.find(s => s.difficulty === "Medium")?.count || 0;
  user.hard = stats.find(s => s.difficulty === "Hard")?.count || 0;
  user.points += earnedToday;
  user.lastSync = new Date();

  await user.save();
  return earnedToday;
}

/* ------------------------------ CRON BATCH --------------------------------- */
app.get("/api/system/sync-batch", async (req, res) => {
  const potd = await DailyPOTD.findOne({ date: todayKey() });
  if (!potd) return res.json({ message: "No POTD today" });

  const users = await User.find().sort({ lastSync: 1 });

  for (const u of users) {
    await syncUser(u.username, potd);
    await new Promise(r => setTimeout(r, 1500));
  }

  res.json({ message: `Synced ${users.length} users` });
});

/* ------------------------------- LEADERBOARD -------------------------------- */
app.get("/api/leaderboard", async (_, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
