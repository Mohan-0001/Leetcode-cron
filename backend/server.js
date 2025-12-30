import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { connectDB } from "./utils/db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();

const DAILY_PROBLEMS = ["two-sum", "palindrome-number", "roman-to-integer", "longest-common-prefix", "valid-parentheses"];

const getHeaders = () => {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  ];
  return {
    "Referer": "https://leetcode.com",
    "Content-Type": "application/json",
    "User-Agent": agents[Math.floor(Math.random() * agents.length)],
  };
};

async function syncUserLeetCodeData(username) {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const midnightTimestamp = Math.floor(todayMidnight.getTime() / 1000);

  const query = `query combinedUserStats($username: String!) {
    matchedUser(username: $username) {
      submitStats { acSubmissionNum { difficulty count } }
    }
    recentSubmissionList(username: $username, limit: 10) {
      titleSlug timestamp statusDisplay
    }
  }`;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables: { username } },
      { 
        timeout: 15000, 
        headers: getHeaders()
      }
    );

    const data = response.data.data;
    if (!data?.matchedUser) return null;

    const stats = data.matchedUser.submitStats.acSubmissionNum;
    const easy = stats.find(i => i.difficulty === "Easy")?.count || 0;
    const med = stats.find(i => i.difficulty === "Medium")?.count || 0;
    const hard = stats.find(i => i.difficulty === "Hard")?.count || 0;
    
    let totalPoints = (easy * 1) + (med * 2) + (hard * 3);
    const solvedBonusToday = new Set();

    data.recentSubmissionList?.forEach(sub => {
      if (sub.statusDisplay === "Accepted" && parseInt(sub.timestamp) >= midnightTimestamp && DAILY_PROBLEMS.includes(sub.titleSlug)) {
        solvedBonusToday.add(sub.titleSlug);
      }
    });

    totalPoints += (solvedBonusToday.size * 10);

    return await User.findOneAndUpdate(
    { username: username.toLowerCase() },
    { 
      easy, 
      medium: med, 
      hard, 
      points: totalPoints, 
      lastSync: Date.now() 
    }, 
    { upsert: true, new: true } 
  );
  } catch (err) {
    console.error(`⚠️ Skipping ${username}: ${err.message}`);
    return null;
  }
}

// --- SYSTEM BATCH ROUTE (Triggered by GitHub Action) ---
app.get("/api/system/sync-batch", async (req, res) => {
  const { auth, limit } = req.query;
  const syncLimit = parseInt(310) || 310; // Default to 30 for hourly refresh

  if (auth !== process.env.SYNC_SECRET) {
    console.log("🚫 Unauthorized batch attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // We fetch the "Stalest" users directly from DB
    const usersToSync = await User.find()
      .sort({ lastSync: 1 }) 
      .limit(syncLimit);

    console.log(`🚀 BATCH: Processing ${usersToSync.length} users...`);

    for (const user of usersToSync) {
      const result = await syncUserLeetCodeData(user.username);
      if (result) console.log(`   ✅ Done: ${user.username}`);
      await new Promise(r => setTimeout(r, 2500)); // Protective delay
    }

    res.json({ message: `Successfully processed ${usersToSync.length} users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INDIVIDUAL API ROUTES ---
app.get("/api/leetcode/:username", async (req, res) => {
  const user = await syncUserLeetCodeData(req.params.username);
  user ? res.json(user) : res.status(500).send("Sync Failed");
});

app.get("/api/leaderboard", async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

// Start Server
app.listen(5000, () => {
    console.log("-----------------------------------------");
    console.log("🚀 Server Live on Port 5000");
    console.log("🔑 Batch Sync Route: /api/system/sync-batch");
    console.log("-----------------------------------------");
});