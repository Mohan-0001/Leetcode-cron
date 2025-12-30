import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { connectDB } from "./utils/db.js";
import users from "./user.json" assert { type: "json" };

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();


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

const getHeaders = () => {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  ];
  return {
    "Referer": "https://leetcode.com",
    "Content-Type": "application/json",
    "User-Agent": agents[Math.floor(Math.random() * agents.length)],
  };
};

const DAILY_PROBLEMS = [
  "find-the-town-judge",
  "number-of-provinces",
  "find-closest-node-to-given-two-nodes",
  "maximize-amount-after-two-days-of-conversions",
  "minimum-cost-path-with-edge-reversals"
];

async function syncUserLeetCodeData(username) {
  const now = new Date();
  // Today 12:00 AM
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // Tomorrow 12:00 AM
  const endOfToday = startOfToday + (24 * 60 * 60 * 1000);

  const query = `query combinedUserStats($username: String!) {
    matchedUser(username: $username) {
      submitStats { acSubmissionNum { difficulty count } }
    }
    recentSubmissionList(username: $username, limit: 50) {
      titleSlug timestamp statusDisplay
    }
  }`;

  try {
    const response = await axios.post("https://leetcode.com/graphql", 
      { query, variables: { username } }, { timeout: 10000, headers: getHeaders() }
    );

    const data = response.data.data;
    if (!data?.matchedUser) return null;

    const stats = data.matchedUser.submitStats.acSubmissionNum;
    const easy = stats.find(i => i.difficulty === "Easy")?.count || 0;
    const med = stats.find(i => i.difficulty === "Medium")?.count || 0;
    const hard = stats.find(i => i.difficulty === "Hard")?.count || 0;

    const solvedBonusToday = new Set();
    data.recentSubmissionList?.forEach(sub => {
      const subTime = parseInt(sub.timestamp) * 1000;
      
      if (
        sub.statusDisplay === "Accepted" && 
        DAILY_PROBLEMS.includes(sub.titleSlug) &&
        subTime >= startOfToday && 
        subTime < endOfToday
      ) {
        solvedBonusToday.add(sub.titleSlug);
      }
    });

    // Calculate total points for TODAY'S POTDs
    let totalPoints = (solvedBonusToday.size * 10);

    return await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { easy, medium: med, hard, points: totalPoints, lastSync: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`Error syncing ${username}:`, err.message);
    return null;
  }
}

// --- SYSTEM BATCH ROUTE ---
app.get("/api/system/sync-batch", async (req, res) => {
  const { auth } = req.query;
  
  // 1. SAFE LIMIT: Only 60 users per "Watchman" visit to prevent timeout
  const syncLimit = 60; 

  if (auth !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const usersToSync = await User.find()
      .sort({ lastSync: 1 }) 
      .limit(syncLimit);

    console.log(`🚀 BATCH START: Processing ${usersToSync.length} users...`);

    for (const user of usersToSync) {
      const result = await syncUserLeetCodeData(user.username);
      if (result) console.log(`   ✅ Synced: ${user.username}`);
      // Small delay to be polite to LeetCode
      await new Promise(r => setTimeout(r, 1500)); 
    }

    console.log("🏁 BATCH FINISHED");
    res.json({ message: `Successfully processed ${usersToSync.length} users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));