// import { useState } from "react";

// export default function App() {
//   const [username, setUsername] = useState("");
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("today");

//   // State for leaderboard so we can update it dynamically
//   const [leaderboard, setLeaderboard] = useState([
//     { name: "Devesh_Chaudhary1712", easy: 160, med: 248, hard: 39, points: 500, trophy: "🥇" },
//     { name: "Code-With-Ashhar", easy: 478, med: 443, hard: 68, points: 500, trophy: "🥈" },
//     { name: "teena1", easy: 161, med: 477, hard: 68, points: 490, trophy: "🥉" },
//   ]);

//   // Helper to extract count by difficulty from the API arrays
//   const getCount = (list, difficulty) => {
//     const item = list?.find(d => d.difficulty === difficulty);
//     return item ? item.count : 0;
//   };

//   const fetchData = async () => {
//     if (!username) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/leetcode/${username}`);
//       const json = await res.json();
      
//       if (res.ok) {
//         setData(json);
        
//         // Calculate dynamic points for the user (Example logic: Easy=1, Med=2, Hard=3)
//         const easyCount = getCount(json.acSubmissionNum, 'Easy');
//         const medCount = getCount(json.acSubmissionNum, 'Medium');
//         const hardCount = getCount(json.acSubmissionNum, 'Hard');
//         const calculatedPoints = (easyCount * 1) + (medCount * 2) + (hardCount * 3);

//         const newUser = {
//           name: username,
//           easy: easyCount,
//           med: medCount,
//           hard: hardCount,
//           points: calculatedPoints,
//           isNew: true // To highlight the searched user
//         };

//         // Update Leaderboard: Add user if not present, then sort by points
//         setLeaderboard(prev => {
//           const filtered = prev.filter(user => user.name.toLowerCase() !== username.toLowerCase());
//           const updatedList = [newUser, ...filtered].sort((a, b) => b.points - a.points);
//           return updatedList;
//         });

//         setActiveTab("leaderboard"); // Switch tab to show the update
//       } else {
//         alert(json.error || "User not found");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
//       <div className="max-w-5xl mx-auto">
        
//         {/* Header Section */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight italic">
//             🚀 GLA Bootcamp POTD
//           </h1>
//           <p className="text-blue-500 font-medium italic mt-2 underline decoration-yellow-400 decoration-2">
//              Consistency is the code to success
//           </p>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="flex justify-center gap-3 mb-8">
//           <button 
//             onClick={() => setActiveTab("today")}
//             className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'today' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 border'}`}
//           >
//             📅 Today's Challenge
//           </button>
//           <button 
//             onClick={() => setActiveTab("leaderboard")}
//             className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 border'}`}
//           >
//             🏆 Top Performers
//           </button>
//         </div>

//         {/* Search Bar */}
//         <div className="flex max-w-lg mx-auto mb-12 shadow-md rounded-xl overflow-hidden bg-white border border-gray-200">
//           <input
//             className="flex-1 p-4 outline-none text-lg"
//             placeholder="Search LeetCode Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <button 
//             onClick={fetchData} 
//             className="bg-blue-600 text-white px-8 font-bold hover:bg-blue-700 disabled:opacity-50"
//             disabled={loading}
//           >
//             {loading ? "..." : "Load"}
//           </button>
//         </div>

//         {activeTab === "today" ? (
//           <div className="space-y-6">
//             <ChallengeCard title="Sum of All Subset XOR Totals" diff="Easy" desc="The XOR total of an array is defined as the bitwise XOR of all its elements..." />
//             <ChallengeCard title="Minimum Time to Break Locks I" diff="Medium" desc="Bob is stuck in a dungeon and must break n locks, each requiring energy..." />
//           </div>
//         ) : (
//           /* LEADERBOARD TABLE */
//           <div className="bg-white rounded-2xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
//              <table className="w-full text-left">
//                 <thead className="bg-gray-50 border-b">
//                   <tr className="text-gray-400 text-xs font-bold uppercase">
//                     <th className="px-6 py-4">Rank</th>
//                     <th className="px-6 py-4">Student</th>
//                     <th className="px-6 py-4 text-center text-green-600">Easy</th>
//                     <th className="px-6 py-4 text-center text-orange-500">Med</th>
//                     <th className="px-6 py-4 text-center text-red-500">Hard</th>
//                     <th className="px-6 py-4 text-center">Points</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {leaderboard.map((item, idx) => (
//                     <tr key={idx} className={`${item.isNew ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'} transition-colors`}>
//                       <td className="px-6 py-5 font-bold text-gray-400">
//                         {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
//                       </td>
//                       <td className="px-6 py-5 font-extrabold text-gray-700 flex items-center gap-2">
//                          <span className="text-xl">🏆</span>
//                          {item.name}
//                       </td>
//                       <td className="px-6 py-5 text-center font-bold text-green-500">{item.easy}</td>
//                       <td className="px-6 py-5 text-center font-bold text-orange-400">{item.med}</td>
//                       <td className="px-6 py-5 text-center font-bold text-red-500">{item.hard}</td>
//                       <td className="px-6 py-5 text-center">
//                         <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black">
//                           {item.points}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//              </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ChallengeCard({ title, diff, desc }) {
//   return (
//     <div className="bg-white border rounded-2xl p-6 shadow-sm border-l-8 border-l-blue-500">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h3 className="text-xl font-black text-gray-800">{title}</h3>
//           <div className="flex gap-2 mt-1">
//             <span className={`${diff === 'Easy' ? 'text-green-500' : 'text-orange-500'} text-xs font-black uppercase tracking-widest`}>{diff}</span>
//             <span className="text-blue-500 text-xs font-bold">Algorithm • 🔥 Today</span>
//           </div>
//         </div>
//         <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md">Solve & Earn</button>
//       </div>
//       <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
//     </div>
//   );
// }



































// import { useState, useEffect } from "react";

// export default function App() {
//   const [username, setUsername] = useState("");
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [activeTab, setActiveTab] = useState("leaderboard");
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncProgress, setSyncProgress] = useState(0);

//   // The clean list of usernames from your text
//   const userList = ["Devesh_Chaudhary1712", "Code-With-Ashhar", "teena1", "aryaman123", "devanshbansal25072004", "__palak_g08", "Priya_490", "Durgesh_leetcode23cs", "Syed-Adeeb-Hussain", "sidrajagrawal", "Deeksha_Agarwal", "Anshu_raj_yadav", "programmer_exe", "Nishantchahar_07P", "deepti_leet", "as20041009", "arsh1005", "Harshit-18", "kanishkaag", "JainSiddhantOfficial", "neelmani_p999", "Gangadhar_cs23", "AyushChaudhary_18", "ayushiagrawal0502", "arya_gupta01", "sakshamwadhwa", "Kuldeep_Garg", "Neha_Singh_j", "Yash_Raj_Sharma", "arti_saini_cs12", "yasl1", "Saksham_Gupta0531", "RupamGanguly46", "Uday-Kushwah", "Namit_jain", "krishnatanwar", "krishna_singh24", "SamriddhiAgrawal", "its_ak12", "Kush_Gupta2006", "sunil_singh_030", "palaksharma1418", "Shreeja_singh", "ash98ketchum_", "VanishaMittal09", "kratika_agrawal_", "Priyanshu__Nayak", "anushree_123", "gauravmittal9205", "n7VPPMuNJj", "rudraksh974", "Gopal_Varshney", "Anant-27", "manasvi_gupta", "arunkushwah595", "omdutt2004", "mauryaamrita835", "madhav_g", "Aadya24", "Anashva_07", "sumit6316", "Ayushi_2005", "ARPIT-KHANDELWAL-CODE", "Vanshika_Varshney03", "remanshu_goyal98", "ankit_saraswat0611", "asyncHarshit", "ayushawasthi_cs23", "ramlal_1", "atitiwari", "AdeshKuntal", "nitendra7", "Kavya_Upadhyay", "drvagl263", "user8998mx", "ayush23chaudhary", "Ankit_Pandey1", "UpendraChaturvedi", "gauravkumar001", "jatinagrawal0917", "aa5545", "Deeksha_Gupta1", "Anantika09", "ashmita_ag21", "humannn", "Shubh-Kesharwani", "Khushi1825", "h_singhal11", "VivekChaudhary111", "Rinki_Jha", "anuj_saxena_11", "Soumya_Upadhyay", "krishnasaraswat", "chaharharsh67", "ishi_rathore13", "ishuagrawal124356", "akratimaheshwa_cs", "Chitrang_agrawal", "Naveen160604", "UmeshGoyal_44", "Yachna_Raghav", "arnavpandey2004", "deepa_choudhary", "Mukund-Varshney", "krishan_7206", "AryaPratap310", "Krishna_Bhardwaj", "Sanya_8733", "hello_pushkar", "KirtiChaudhary_15", "ManishJha_Leet01", "Bhuvanesh_vashishth", "aman_kush23", "Basant_Bhargav", "Pavitra_Malhotra", "prakhar-1310", "samman_varshney", "Aayush_kumar2005", "_khushi_prajapati09", "Priyanshu200519", "saraf_kushagra", "PRVN_2023", "rachit0812", "kushKumar_07", "manoj_8057", "abhaycodes_912", "_Rishabh_Sengar", "paandaa", "Gaurav_4444", "priyanshugupta7905", "jiya-jain", "Pankit_Jain", "Mohd_Ayaan_Hussain", "ASHISH_CHAHAR", "sankhuz", "devc37440", "SuhaniSharma2235", "_Nitin_02", "Ananya_Jaiswal08", "Vanshika_Sahu050605", "adityakumarsri_cs23", "PRANAV_74259", "aparna_here_2024", "HARSHIT_BHARDWAJ1", "rana8923am", "kartikay_garg_09", "Yuvi_514", "Ritik-Saxena", "shivam_821", "_harsh_agrawal_", "Aditya_Shukla_1", "vanshika_goyal1", "piyushpratap001", "Riya_Khandelwal13", "Nikhil_chahar", "Samarth1089", "naveen160604", "Krishna_Agrawal0612", "ashutoshpal63", "Shreyajain07", "ananya_tiwari_30", "rudraagrawal191", "deepika-sisodia", "MokshUpadhyay2027", "Gun_07", "Nikup_123", "nikhiltiwari11", "Abhinav_Kumar_Tiwari", "Nitin10_08", "Milan_Choudhary", "ITS_AK12", "ankurmittal9081", "Laxita_13", "Mohan_Gupta1", "IamAkshat_006", "TrishaAgarwal", "lakshrajput_22", "Himanms_Goyal", "Harsh8699", "Prvn_2023", "pirsoonkumar", "Lucky_jain_btech", "Vishalchaudhary_", "akashupadhyay123", "shubham-singhal", "Harshit_295", "Manoj_8057", "manunderthehood", "mahakgupta_2588", "AYUSH23CHAUDHARY", "ManUnderTheHood", "not_now_baby", "vishalchaudhary_", "shivam_sharma11", "Kamal_Sharma_22", "manish__kumar123", "Kinjalgupta", "ANANT-27", "gangadhar_cs23", "mohinibharti05", "Divyansh_Yadav001", "shikharvarshney1008", "kinjalgupta", "SHIKHAR_SHAURYA", "ayushi_2005", "rinki_jha", "vkaushik1530", "_harshit1921", "agrim_cs", "hardeepbainiwal", "SnehaVerma7", "Sankhuz", "ASTER0909", "shrutigupta10", "ashu_pandey84", "Gauri_Chauhan", "prvn_2023", "Vanshika_sahu050605", "kartikay_Garg_09", "VikhyatSharma", "anshkmrn", "akshitasaxena", "manish_jha", "sanskar", "Aditya_Shukla", "Apoorv_Mehrotra", "vanshika", "pranav01", "manish_jham", "priyanshugupta24", "Arumesh_Gupta", "aster0909", "SHAGUN_NAYAK", "19t4SGXixa", "SidAgrawal", "durgesh_leetcode23cs", "Sneha7", "ritugoyal21_", "Shreya01", "Gaurav___Chaudhary", "ShikharShaurya", "sye", "nitesh", "san_kat_87", "riddhima44", "Srishti-Agarwal2004", "Abhijeet0078", "tourist", "Petr", "neal", "adamant", "ecnerwala", "syduck07", "sparshkashyap", "Kartikay_garg_09", "KhushiBhardwaj28", "cpcs", "Bhoomika_12", "vinay_chaudhary-codes", "riddhima", "Rupam", "Hello", "jatinagrawal1704", "rahul954812", "Priya_49", "shubhangd205", "praveen_2023", "Kush_Gupta"];

//   const getLeaderboard = async () => {
//     const res = await fetch("http://localhost:5000/api/leaderboard");
//     const json = await res.json();
//     setLeaderboard(json);
//   };

//   useEffect(() => {
//     getLeaderboard();
//   }, []);

//   // AUTOMATED SYNC FUNCTION
//   const syncAllUsers = async () => {
//     if (!window.confirm("This will fetch data for 260+ users. Start sync?")) return;
    
//     setIsSyncing(true);
//     for (let i = 0; i < userList.length; i++) {
//       try {
//         await fetch(`http://localhost:5000/api/leetcode/${userList[i]}`);
//         setSyncProgress(Math.round(((i + 1) / userList.length) * 100));
//       } catch (err) {
//         console.error("Failed for", userList[i]);
//       }
//       // Small delay to prevent rate limits
//       await new Promise(r => setTimeout(r, 100));
//     }
//     setIsSyncing(false);
//     getLeaderboard(); // Final refresh
//   };

//   const handleSearch = async () => {
//     const res = await fetch(`http://localhost:5000/api/leetcode/${username.trim()}`);
//     if (res.ok) {
//       await getLeaderboard();
//       setActiveTab("leaderboard");
//     } else {
//       alert("User not found!");
//     }
//   };

//   return (
//     <div className="p-8 max-w-5xl mx-auto font-sans bg-gray-50 min-h-screen">
//       {/* Search and Sync Controls */}
//       <div className="flex flex-col items-center gap-4 mb-10">
//         <div className="flex gap-2">
//           <input 
//             className="border p-3 rounded-lg w-72 shadow-sm outline-blue-500"
//             placeholder="Search LeetCode Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
//             Load
//           </button>
//         </div>

//         <button 
//           onClick={syncAllUsers} 
//           disabled={isSyncing}
//           className="text-sm font-bold text-orange-600 hover:underline disabled:text-gray-400"
//         >
//           {isSyncing ? `🔄 Syncing... ${syncProgress}%` : "⚡ Auto-Sync All Users"}
//         </button>

//         {isSyncing && (
//           <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
//             <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
//           </div>
//         )}
//       </div>

//       <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 border-b">
//             <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
//               <th className="p-4">Rank</th>
//               <th className="p-4">Student</th>
//               <th className="p-4 text-center">Easy</th>
//               <th className="p-4 text-center">Med</th>
//               <th className="p-4 text-center">Hard</th>
//               <th className="p-4 text-center">Points</th>
//             </tr>
//           </thead>
//           <tbody>
//             {leaderboard.map((user, index) => (
//               <tr key={user._id || index} className="border-b hover:bg-blue-50 transition">
//                 <td className="p-4 font-bold text-gray-400">
//                   {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
//                 </td>
//                 <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
//                    <span className="text-blue-500">⚔️</span> {user.username}
//                 </td>
//                 <td className="p-4 text-center text-green-500 font-bold">{user.easy || 0}</td>
//                 <td className="p-4 text-center text-orange-400 font-bold">{user.medium || 0}</td>
//                 <td className="p-4 text-center text-red-500 font-bold">{user.hard || 0}</td>
//                 <td className="p-4 text-center">
//                   <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black">
//                     {user.points || 0}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }











































import { useState, useEffect } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Your full list of usernames (truncated for brevity)
  const userList = ["Devesh_Chaudhary1712", "Code-With-Ashhar", "teena1", "aryaman123", "devanshbansal25072004", "__palak_g08"]; 

  const getLeaderboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/leaderboard");
      const json = await res.json();
      setLeaderboard(json);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  // NEW: Optimized Batch Sync Function
  const syncAllUsers = async () => {
    if (!window.confirm("Sync all user data? This uses optimized batching.")) return;
    
    setIsSyncing(true);
    const batchSize = 5; // Process 5 users at once to speed up
    
    for (let i = 0; i < userList.length; i += batchSize) {
      const batch = userList.slice(i, i + batchSize);
      console.log(batch);
      
      // Execute 5 requests in parallel
      await Promise.all(batch.map(async (user) => {
        try {
          await fetch(`http://localhost:5000/api/leetcode/${user}`);
          console.log(user);
        } catch (err) {
          console.error(`Sync failed for ${user}`);
        }
      }));

      // Update progress and refresh leaderboard partially
      setSyncProgress(Math.round(((i + batch.length) / userList.length) * 100));
      getLeaderboard(); 

      // Small cooldown to prevent LeetCode rate limits
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsSyncing(false);
    getLeaderboard(); // Final refresh
  };

  const handleSearch = async () => {
    // if (!username.trim()) return;
    const res = await fetch(`http://localhost:5000/api/leetcode/${username.trim()}`);
    if (res.ok) {
      getLeaderboard();
      setUsername("");
    } else {
      alert("User not found!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">LeetCode <span className="text-blue-600">ProSync</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input 
                className="bg-slate-100 border border-transparent rounded-full py-2 px-5 pl-10 text-sm w-64 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Search user..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <svg className="w-4 h-4 absolute left-4 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
              onClick={syncAllUsers} 
              disabled={isSyncing}
              className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
            >
              {isSyncing ? `Syncing ${syncProgress}%` : "⚡ Refresh All"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Progress Bar Header */}
        {isSyncing && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Processing Batch Data...</span>
              </div>
              <span className="text-sm font-black text-blue-700">{syncProgress}%</span>
            </div>
            <div className="w-full bg-blue-200/50 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-500 ease-out" style={{ width: `${syncProgress}%` }} />
            </div>
          </div>
        )}

        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Participants</p>
              <h3 className="text-3xl font-black text-slate-800">{leaderboard.length}</h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-slate-400">👤</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-xl shadow-blue-100 text-white relative overflow-hidden">
             <div className="relative z-10">
                <p className="opacity-80 text-xs font-bold uppercase tracking-wider mb-1">Bonus Target</p>
                <h3 className="text-xl font-bold">+10 pts for Daily 5</h3>
                <p className="text-[10px] mt-2 opacity-70 font-medium italic">Resets at 12:00 AM</p>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-10 text-8xl rotate-12 font-black">★</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">System Status</p>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" /> Healthy
              </h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-slate-400">⚙️</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                  <th className="py-6 px-8 text-center">Rank</th>
                  <th className="py-6 px-4">LeetCode User</th>
                  <th className="py-6 px-4 text-center">Easy</th>
                  <th className="py-6 px-4 text-center">Med</th>
                  <th className="py-6 px-4 text-center">Hard</th>
                  <th className="py-6 px-8 text-right">Aggregated Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((user, index) => (
                  <tr key={user._id || index} className="group hover:bg-slate-50/80 transition-all duration-150">
                    <td className="py-5 px-8">
                      <div className={`flex items-center justify-center mx-auto w-9 h-9 rounded-xl font-black text-sm transition-all
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                          index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' : 
                          index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                          'text-slate-400 bg-white border border-slate-100'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-slate-200 uppercase">
                          {user.displayName?.slice(0, 2) || user.username.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-black text-slate-700 text-sm">{user.displayName || user.username}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-emerald-600">{user.easy || 0}</span>
                        <div className="h-1 w-4 bg-emerald-100 rounded-full mt-1"></div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-amber-600">{user.medium || 0}</span>
                        <div className="h-1 w-4 bg-amber-100 rounded-full mt-1"></div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-rose-600">{user.hard || 0}</span>
                        <div className="h-1 w-4 bg-rose-100 rounded-full mt-1"></div>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-inner group-hover:bg-blue-600 transition-colors">
                        <span className="text-sm font-black tabular-nums">{user.points || 0}</span>
                        <span className="text-[8px] opacity-60 uppercase font-black">XP</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}