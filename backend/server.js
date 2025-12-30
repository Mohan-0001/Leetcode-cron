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
// const USER_LIST = ["Devesh_Chaudhary1712", "Code-With-Ashhar", "teena1", "aryaman123", "devanshbansal25072004", "__palak_g08"];
const USER_LIST = await User.find().distinct("username");
// Helper to rotate User-Agents to bypass basic bot detection
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
        timeout: 25000, // 20 seconds
        headers: getHeaders()
      }
    );

    const data = response.data.data;
    // console.log(data);
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
      { username: username.toLowerCase(), displayName: username, easy, medium: med, hard, points: totalPoints, lastSync: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    // If we hit a timeout, the server IP is likely being temporarily throttled
    console.error(`⚠️ Skipping ${username} due to connection issues.`,err);
    return null;
  }
}

app.get("/api/system/sync-batch", async (req, res) => {
  const { auth, limit } = req.query;
  const syncLimit = parseInt(limit) || 10; // Default to 10 if not specified

  if (auth !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get the users who haven't been synced for the longest time
    const usersToSync = await User.find()
      .sort({ lastSync: 1 }) 
      .limit(syncLimit);

    console.log(`🚀 Starting High-Speed Batch: ${usersToSync.length} users`);

    // Process them one by one with a tiny gap
    for (const user of usersToSync) {
      await syncUserLeetCodeData(user.username);
      // 2-second gap is enough when using GitHub's fresh IPs
      await new Promise(r => setTimeout(r, 2000)); 
    }

    res.json({ message: `Successfully processed ${usersToSync.length} users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const startTime = Date.now();
let total_successful_syncs = 0;
let currentIndex = 0;
async function startBackgroundSync() {

  const userToSync = USER_LIST[currentIndex];
  
  const result = await syncUserLeetCodeData(userToSync);
  if (result) {
    console.log(`✅ [LOOP] Synced ${userToSync} -> ${currentIndex}`);
    total_successful_syncs += 1;
  }
  if(currentIndex === USER_LIST.length-1){
    const elapsed = ((Date.now()) - startTime) / 1000;
    console.log(`🔄 Completed full sync cycle for ${USER_LIST.length} users in ${elapsed.toFixed(2)} seconds.`);
  }
  currentIndex = (currentIndex + 1) % USER_LIST.length;

  // INCREASE DELAY: 5-8 seconds is the "Sweet Spot" 
  // to avoid getting banned while managing 500 users.
  const delay = Math.floor(Math.random() * (8000 - 5000 + 1) + 5000);
  setTimeout(startBackgroundSync, delay);
}

startBackgroundSync();

// API Routes
app.get("/api/leetcode/:username", async (req, res) => {
  const user = await syncUserLeetCodeData(req.params.username);
  user ? res.json(user) : res.status(500).send("Sync Failed");
});

app.get("/api/leaderboard", async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

app.listen(5000, () => console.log("Backend Running with Protective Sync..."));