"use strict";

/* ══════════════════════════════════════════════════════════════════
   THEME / MODE  (same mechanism as the 9626 study site)
══════════════════════════════════════════════════════════════════ */
function setMode(mode){
  document.documentElement.setAttribute("data-mode", mode);
  localStorage.setItem("datalab-mode", mode);
  updateModeButtons(mode);
  drawChart();
}
function updateModeButtons(mode){
  document.getElementById("btn-light").classList.toggle("active", mode === "light");
  document.getElementById("btn-auto").classList.toggle("active", mode === "auto");
  document.getElementById("btn-dark").classList.toggle("active", mode === "dark");
}
updateModeButtons(document.documentElement.getAttribute("data-mode") || "auto");

/* ══════════════════════════════════════════════════════════════════
   DATASETS — sample rows (metric units only) + metadata for codegen
   flagged: cell values to highlight as "messy / suspicious"
══════════════════════════════════════════════════════════════════ */
const DATASETS = {
  "sports_day.csv": {
    cat:"House", numMain:"High Jump (meters)", numAlt:"100m Sprint Time (seconds)",
    corrX:"Age", corrY:"High Jump (meters)",
    flaw:'some sprint times are text like "14.2s" and some jumps are blank',
    fix:'df["100m Sprint Time (seconds)"] = (\n    df["100m Sprint Time (seconds)"].astype(str)\n      .str.replace("s", "").astype(float))',
    headers:["Student","House","Age","Sprint (s)","Jump (m)"],
    rows:[["S1005","Blue","12","16.18s","1.02"],["S1015","Red","13","15.81",null],
          ["S1027","Yellow","15","15.63s","1.29"],["S1042","Green","11","17.40","0.88"]],
    flagged:["16.18s","15.63s"]
  },
  "spotify_tracks.csv": {
    cat:"Popularity Tier", numMain:"Total Streams", numAlt:"Tempo (BPM)",
    corrX:"Song Duration (seconds)", corrY:"Total Streams",
    flaw:"8 rows are exact duplicates of other rows",
    fix:'df = df.drop_duplicates()',
    headers:["Song","Genre","Streams","Tier"],
    rows:[["Midnight Dreams","Pop","3,204,551","Gold"],["Golden Echo","Indie","5,880,002","Platinum"],
          ["Midnight Dreams","Pop","3,204,551","Gold"],["Frozen Tides","Rock","410,228","Bronze"]],
    flagged:["Midnight Dreams"]
  },
  "gaming_data.csv": {
    cat:"Platform", numMain:"Monthly Revenue (£)", numAlt:"Hours Streamed",
    corrX:"Hours Streamed", corrY:"Followers",
    flaw:"the Platform labels are inconsistent, 25 scores are blank and 2 revenues are enormous",
    fix:'df["Platform"] = df["Platform"].str.lower().str.replace("_tv", "")',
    headers:["Creator","Platform","Followers","Revenue (£)"],
    rows:[["GoldenKnight554","Twitch","56,478","350.39"],["MegaWolf475","YouTube","136,082","144.51"],
          ["ShadowFox210","twitch","9,210",null],["NeonViper88","TWITCH_tv","204,553","9,870,500.50"]],
    flagged:["twitch","TWITCH_tv","9,870,500.50"]
  },
  "viral_analytics.csv": {
    cat:"Category", numMain:"Subscriber Count", numAlt:"Avg Views",
    corrX:"Subscriber Count", corrY:"Avg Views",
    flaw:"Category spellings vary, 30 video lengths are blank and 3 mega-channels warp the mean",
    fix:'df["Category"] = df["Category"].str.lower().str.replace("_", " ")',
    headers:["Handle","Category","Subscribers","Avg Views"],
    rows:[["@ItsMaya42","gaming","88,420","21,005"],["@RealKai7","Gaming","312,000,000","210,000,000"],
          ["@JustLeo3","tech","12,300","4,100"],["@TeamIvy5","Tech_Reviews","90,500","33,200"]],
    flagged:["312,000,000","210,000,000","Gamer_vids","Tech_Reviews"]
  },
  "burger_builder.csv": {
    cat:"Category", numMain:"Calories", numAlt:"Fat (grams)",
    corrX:"Fat (grams)", corrY:"Calories",
    flaw:'Price is text like "£4.99", 12 rows are duplicated and one item is 6,000 kcal',
    fix:'df["Price"] = df["Price"].str.replace("£", "").astype(float)',
    headers:["Chain","Item","Category","Calories","Price"],
    rows:[["McDonald's","Cheeseburger","Burger","303","£3.19"],["KFC","Fries","Sides","320","£2.49"],
          ["Five Guys","Family Mega Platter","Burger","6000","£29.99"],["Greggs","Doughnut","Dessert","290","£1.10"]],
    flagged:["6000","£29.99"]
  },
  "canteen_sales.csv": {
    cat:"Category", numMain:"Quantity Sold", numAlt:"Outside Temp (Celsius)",
    corrX:"Outside Temp (Celsius)", corrY:"Quantity Sold",
    flaw:"20 categories are blank, one sale shows 150 items and cold days spike hot-food sales",
    fix:'df["Category"] = df["Category"].fillna("Unknown")',
    headers:["Date","Item","Category","Qty","Temp (°C)"],
    rows:[["2024-09-05","Pizza Slice","Hot Food","41","22.4"],["2024-12-11","Soup of the Day","Hot Food","78","2.1"],
          ["2025-01-20","Pizza Slice",null,"150","-0.1"],["2025-03-02","Apple","Fruit","25","11.3"]],
    flagged:["150"]
  }
};

/* ══════════════════════════════════════════════════════════════════
   TOPICS — each returns tier-aware task / code / terminal + skills.
   Generators receive the dataset metadata so they adapt per week.
══════════════════════════════════════════════════════════════════ */
const P = '<span class="p">&gt;&gt;&gt;</span> ';
const dim = s => '<span class="dim">'+s+'</span>';
const warn = s => '<span class="warn">'+s+'</span>';
const ok = s => '<span class="ok">'+s+'</span>';
const T = (a,c,m) => ({ apprentice:a, craftsman:c, master:m });   // tier picker helper

const TOPICS = {
  types: {
    skills:["Identify data types (text, whole number, decimal)","Read a DataFrame's structure with .info()","Convert columns to the correct type"],
    task: T("Open <b>{f}</b> and work out the <b>data type</b> of every column.",
            "Convert each column to its correct type so numbers behave like numbers.",
            "Classify every column as categorical, discrete or continuous, then fix any wrong types."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df.dtypes)        # what type is each column?`,
`import pandas as pd

df = pd.read_csv("${ds.f}")
df["Age"] = df["Age"].astype("int")
print(df.dtypes)`,
`import pandas as pd

df = pd.read_csv("${ds.f}")
kinds = {"${ds.cat}": "categorical",
         "${ds.numMain}": "continuous"}
print(kinds)`),
    term: ds => T(
P+"df.dtypes\n"+dim("Age            int64\n"+ds.cat+"   object\n"+ds.numMain+"   float64"),
P+"df.dtypes\n"+ok("Age            int64")+"\n"+dim("...types corrected"),
P+"print(kinds)\n"+dim("{'"+ds.cat+"': 'categorical',\n '"+ds.numMain+"': 'continuous'}"))
  },
  scales: {
    skills:["Tell nominal from ordinal data","Build an ordered category","Rank ordinal values"],
    task: T("Look at <b>{f}</b>. Which columns have a natural <b>order</b> and which do not?",
            "Turn <b>{cat}</b> into an ordered category (Bronze &lt; Silver &lt; Gold &lt; Platinum).",
            "Map the ordered tiers to numbers so you can sort and compare them fairly."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df["${ds.cat}"].unique())`,
`import pandas as pd
from pandas.api.types import CategoricalDtype

order = ["Bronze","Silver","Gold","Platinum"]
ct = CategoricalDtype(order, ordered=True)
df["${ds.cat}"] = df["${ds.cat}"].astype(ct)`,
`rank = {"Bronze":1,"Silver":2,"Gold":3,"Platinum":4}
df["tier_rank"] = df["${ds.cat}"].map(rank)
print(df.sort_values("tier_rank").head())`),
    term: ds => T(
P+'df["'+ds.cat+'"].unique()\n'+dim("['Gold' 'Platinum' 'Bronze' 'Silver']"),
P+"df.dtypes\n"+ok(ds.cat+"   category (ordered)"),
P+"...\n"+dim("tier_rank now 1..4 — sortable"))
  },
  clean_inconsistent: {
    skills:["Spot inconsistent text labels","Standardise capitalisation and spelling","Re-check value counts after cleaning"],
    task: T("Find every different spelling of the values in <b>{cat}</b> in <b>{f}</b>.",
            "Standardise <b>{cat}</b> so the same thing is written the same way every time.",
            "Build a mapping that merges all variants, then prove the categories are now clean."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df["${ds.cat}"].value_counts())`,
`df["${ds.cat}"] = df["${ds.cat}"].str.strip().str.lower()
print(df["${ds.cat}"].value_counts())`,
`# ${ds.flaw}
${ds.fix}
print(df["${ds.cat}"].value_counts())`),
    term: ds => T(
P+'df["'+ds.cat+'"].value_counts()\n'+warn("Twitch 142\ntwitch  60\nTWITCH_tv 40\n...messy!"),
P+"...\n"+dim("twitch 242\nyoutube 180")+"  "+ok("(merged)"),
P+"...\n"+ok("4 clean categories remain"))
  },
  clean_missing: {
    skills:["Count missing values with .isna()","Decide whether to fill or drop blanks","Detect outliers with the IQR rule"],
    task: T("In <b>{f}</b>, count how many values are <b>missing</b> in each column.",
            "Handle the blanks sensibly, and look for impossibly large values.",
            "Use the IQR rule to flag outliers in <b>{num}</b> — then decide: error, or real?"),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df.isna().sum())`,
`df = df.dropna(subset=["${ds.numMain}"])
print(df.isna().sum().sum(), "blanks left")`,
`q1, q3 = df["${ds.numMain}"].quantile([0.25, 0.75])
iqr = q3 - q1
big = df[df["${ds.numMain}"] > q3 + 1.5*iqr]
print(len(big), "outliers flagged")`),
    term: ds => T(
P+"df.isna().sum()\n"+warn("Satisfaction Score (1-5)   25"),
P+"...\n"+ok("0 blanks left"),
P+"len(big)\n"+warn("2 outliers flagged")+"\n"+dim("# £6.2M and £9.9M — keep or remove?"))
  },
  filter: {
    skills:["Filter rows with a condition","Combine conditions with & and |","Use .query() for readable filters"],
    task: T("From <b>{f}</b>, show only the rows where <b>{cat}</b> is one chosen value.",
            "Filter using two conditions at once (for example House and Age together).",
            "Write a readable .query() that answers a real question about the data."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
older = df[df["${ds.corrX}"] >= 14]
print(older.shape)`,
`mask = (df["${ds.cat}"] == "Red") & (df["${ds.corrX}"] >= 13)
print(df[mask])`,
`fast = df.query("${ds.corrX} >= 14 and \`${ds.numMain}\` > 1.2")
print(fast[["${ds.cat}", "${ds.numMain}"]])`),
    term: ds => T(
P+"older.shape\n"+dim("(96, "+ds.headers.length+")"),
P+"...\n"+dim("18 rows match both conditions"),
P+"...\n"+ok("filtered to the top performers"))
  },
  central: {
    skills:["Calculate mean, median and mode","Compare mean vs median on skewed data","Choose the fairest average to report"],
    task: T("Find the <b>mean</b>, <b>median</b> and <b>mode</b> of <b>{num}</b> in <b>{f}</b>.",
            "Compare the mean and median — what do the two outliers do to each?",
            "Decide which average is the honest one to report, and justify it."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df["${ds.numMain}"].mean())
print(df["${ds.numMain}"].median())`,
`m = df["${ds.numMain}"].mean()
md = df["${ds.numMain}"].median()
print(round(m,2), "vs", round(md,2))`,
`# The mean is dragged up by 2 huge earners
trimmed = df["${ds.numMain}"].clip(upper=3000)
print(round(trimmed.mean(), 2))`),
    term: ds => T(
P+"df['"+ds.numMain+"'].mean()\n"+warn("20512.66")+"\n"+P+"...median()\n"+dim("612.40"),
P+"...\n"+warn("mean 20512.66 vs median 612.40")+"\n"+dim("# huge gap = skew"),
P+"...\n"+ok("612.40")+dim("  (median is the fair report)"))
  },
  spread: {
    skills:["Find range, IQR and standard deviation","Read a distribution's shape","Use .describe() to summarise spread"],
    task: T("Find the <b>range</b> (max − min) of <b>{num}</b> in <b>{f}</b>.",
            "Calculate the standard deviation and the interquartile range.",
            "Use .describe() and decide whether the data is symmetric or skewed."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
rng = df["${ds.numMain}"].max() - df["${ds.numMain}"].min()
print("range:", rng)`,
`print(df["${ds.numMain}"].std().round(2))
print(df["${ds.numMain}"].quantile([.25,.5,.75]))`,
`print(df["${ds.numMain}"].describe())
df["${ds.numMain}"].plot(kind="hist", bins=20)`),
    term: ds => T(
P+'print("range:", rng)\n'+dim("range: 5469774"),
P+"...\n"+dim("std  1.05e6\n25%  410228\n50%  3204551"),
P+"df.describe()\n"+dim("count 300  mean 2.9e6\nstd 1.0e6  ... right-skew"))
  },
  charttypes: {
    skills:["Match a chart type to a question","Use bar, line and box plots appropriately","Avoid misleading chart choices"],
    task: T("Make a simple <b>bar chart</b> of counts per <b>{cat}</b> in <b>{f}</b>.",
            "Pick the right chart for the question — bar, line, scatter or box.",
            "Build a small multi-chart view and argue which chart tells the truth best."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
df["${ds.cat}"].value_counts().plot(kind="bar")`,
`# A box plot compares spread across groups
df.boxplot(column="${ds.numMain}", by="${ds.cat}")`,
`fig, ax = plt.subplots(1, 2)
df["${ds.cat}"].value_counts().plot(kind="bar", ax=ax[0])
df.plot.scatter(x="${ds.corrX}", y="${ds.corrY}", ax=ax[1])`),
    term: ds => T(
P+"...\n"+dim("[bar chart rendered]"),
P+"...\n"+dim("[box plot by "+ds.cat+"]"),
P+"...\n"+ok("[2 panels: counts + relationship]"))
  },
  chartlies: {
    skills:["Recognise a truncated y-axis","Fix axes to start at zero","Explain how charts can mislead"],
    task: T("Plot <b>{num}</b> from <b>{f}</b> with a y-axis that starts high — see the exaggeration.",
            "Re-draw the same chart with the axis starting at 0 and compare.",
            "Annotate the misleading version and write the honest caption underneath."),
    code: ds => T(
`import matplotlib.pyplot as plt

ax = df["${ds.numMain}"].head(5).plot(kind="bar")
ax.set_ylim(580, 650)   # zoomed-in = exaggerated!`,
`ax = df["${ds.numMain}"].head(5).plot(kind="bar")
ax.set_ylim(0, None)    # honest baseline`,
`# Same data, two stories. Always check the axis.
print("Truncated axes exaggerate small gaps.")`),
    term: ds => T(
P+"...\n"+warn("[tiny gaps look huge]"),
P+"...\n"+ok("[gaps now look honest]"),
P+"...\n"+dim("Truncated axes exaggerate small gaps."))
  },
  grouping: {
    skills:["Group rows with .groupby()","Aggregate with mean and count","Build a pivot table"],
    task: T("Group <b>{f}</b> by <b>{cat}</b> and count how many rows are in each group.",
            "For each <b>{cat}</b>, find the average <b>{num}</b> and the group size.",
            "Build a pivot table summarising <b>{num}</b> across two dimensions."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df.groupby("${ds.cat}").size())`,
`g = df.groupby("${ds.cat}")["${ds.numMain}"].agg(["mean","count"])
print(g.round(2))`,
`pt = df.pivot_table(values="${ds.numMain}",
                    index="${ds.cat}", aggfunc="mean")
print(pt.round(2))`),
    term: ds => T(
P+"df.groupby(...).size()\n"+dim(ds.cat+"\nGold 92\nBronze 75\n..."),
P+"...\n"+dim("           mean   count\nGold  4.1e6     92"),
P+"...\n"+ok("[pivot table built]"))
  },
  correlation: {
    skills:["Measure correlation with .corr()","Read a scatter plot","Tell correlation from causation"],
    task: T("In <b>{f}</b>, measure the correlation between <b>{x}</b> and <b>{y}</b>.",
            "Draw a scatter plot of the two columns and describe the relationship.",
            "Build the full correlation matrix and spot the hidden <b>confounding</b> variable."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df["${ds.corrX}"].corr(df["${ds.corrY}"]))`,
`df.plot.scatter(x="${ds.corrX}", y="${ds.corrY}", alpha=0.4)
print("strong, positive" )`,
`print(df.corr(numeric_only=True).round(2))
# Older students are BOTH faster and jump higher:
# Age is a confounder — not proof of causation.`),
    term: ds => T(
P+"df[...].corr()\n"+ok("0.96")+dim("  (very strong)"),
P+"...\n"+dim("[scatter: clear upward trend]"),
P+"df.corr()\n"+dim("Age vs Jump 0.96\nAge vs Sprint -0.89")+"\n"+warn("# confounder: Age"))
  },
  capstone: {
    skills:["Run an end-to-end analysis pipeline","Clean, summarise and visualise independently","Communicate findings with an honest chart"],
    task: T("<b>Capstone Hackathon.</b> Pick a dataset below, then load and explore it on your own.",
            "Clean your chosen dataset and summarise one interesting group.",
            "Full pipeline: clean → analyse → visualise. All sandbox dials are unlocked — make an honest chart that answers your own question."),
    code: ds => T(
`import pandas as pd

df = pd.read_csv("${ds.f}")
print(df.head())
print(df.isna().sum())`,
`# Clean, then summarise
${ds.fix}
print(df.groupby("${ds.cat}")["${ds.numMain}"].mean())`,
`# Tell the story
print(df.corr(numeric_only=True).round(2))
df.plot.scatter(x="${ds.corrX}", y="${ds.corrY}", alpha=0.4)
# Your turn: what's the honest headline?`),
    term: ds => T(
P+"df.head()\n"+dim("[first rows of "+ds.f+"]"),
P+"...\n"+ok("[cleaned + grouped]"),
P+"df.corr()\n"+ok("[relationship found — make your chart!]"))
  }
};

/* ══════════════════════════════════════════════════════════════════
   CURRICULUM MAP — Week -> Lessons -> {topic, dataset}
══════════════════════════════════════════════════════════════════ */
const CURRICULUM = [
  { title:"Foundation & Structure", lessons:[
      { name:"Data Types",  topic:"types",  ds:"sports_day.csv" },
      { name:"Data Scales", topic:"scales", ds:"spotify_tracks.csv" } ]},
  { title:"The Sanitization Lab", lessons:[
      { name:"Data Cleaning I · Inconsistencies", topic:"clean_inconsistent", ds:"gaming_data.csv" },
      { name:"Data Cleaning II · Missing & Outliers", topic:"clean_missing", ds:"gaming_data.csv" } ]},
  { title:"Deep Slicing & Summaries", lessons:[
      { name:"Filtering Data",    topic:"filter",  ds:"sports_day.csv" },
      { name:"Central Tendency",  topic:"central", ds:"gaming_data.csv" } ]},
  { title:"Shape & Visual Rules", lessons:[
      { name:"Spread & Distribution", topic:"spread",     ds:"spotify_tracks.csv" },
      { name:"Chart Types & Use-cases", topic:"charttypes", ds:"sports_day.csv" } ]},
  { title:"Advanced Visuals & Integrity", lessons:[
      { name:"Chart Lies & Misconceptions", topic:"chartlies", ds:"gaming_data.csv" },
      { name:"Grouping Data",               topic:"grouping",  ds:"spotify_tracks.csv" } ]},
  { title:"Connections & Finale", lessons:[
      { name:"Relationships & Correlations", topic:"correlation", ds:"sports_day.csv" },
      { name:"Capstone Hackathon", topic:"capstone", ds:"viral_analytics.csv",
        choices:["viral_analytics.csv","burger_builder.csv","canteen_sales.csv"] } ]}
];
const TIERS = [
  { key:"apprentice", label:"Apprentice" },
  { key:"craftsman",  label:"Craftsman" },
  { key:"master",     label:"Master" }
];
const PASS = 80;   // mastery threshold (%)

/* ══════════════════════════════════════════════════════════════════
   STATE  (the nested-tab path) + persisted progress
══════════════════════════════════════════════════════════════════ */
const state = { week:0, lesson:0, tier:0, capstone:"viral_analytics.csv" };

/* ── AUTH · hashed PINs, admin, and per-user progress ──
   PINs are never stored in the page — only salted SHA-256 hashes.
   The admin can import/update the roster from a CSV; the raw PINs
   are hashed in the browser on import and the plaintext discarded. */
const PIN_SALT = "insightlabs-v1";
const ADMIN_HASH = "b2f487b943eb94ac8183ace031e9909f930ea234327457aba9ee03aa43f36ae8";
// built-in seed roster: { saltedSha256(pin) : student name }
const SEED_ROSTER = {
  "351f67d9c4d99f4875f728d55a36fd9714f28f182b67abf26b04f72e0c2af9f3":"Olivia Bennett",
  "f40639524fa9a8660d57b51d180b45dc5f24620e877210ed916037082487f0e5":"Liam Carter",
  "f9ca02a4e454191e4691225df4bddd60f3fa801f388272549c53b00338add0db":"Emma Rodriguez",
  "913df34f6e2597650d787a1fad231e1e420d27f387c554683714c01b353f6142":"Noah Patel",
  "f9a853e338d288f4051a60b427421b8c6d421b110ca07eb43b0878bce2bef41f":"Ava Thompson",
  "cbb43815412d93550a1ba6882c9bc91dab040bba85f30e6e359a051b909291e4":"Ethan Nguyen",
  "465cb8b9f8e5b488163e15a6be81fa0766ecdcd783f7dfce7ac2c5a3b43633f4":"Sophia Martinez",
  "31d5d6eece9d9704873b50fc800d29a280ba6e8ed89b863d2aa036ff004d486f":"Mason Khan",
  "0188834b9d6b33952aaf18f0e74c5f155cb5c04d6d20397179fafd750ef09f5a":"Isabella Reyes",
  "d4431c65c89a5c642f1cabcdfc2028645fa942c234b295a608374b836368f8b4":"Lucas Murphy",
  "9491914d512cfdd8dcfad45bc82fed668cf49887aa2cf83ad66a92d77ab706e2":"Mia Okafor",
  "f685726df86a39278361bc807e6a683dcf8c14189a7b39adf29958700ef87d2a":"Henry Schmidt",
  "fa1b4495683c08bfeb56d4057423a68ca3e21cbc1d91b4695903aa5ea47e2936":"Amelia Rossi",
  "708d89a4b671f6c58ebdc2c71656ea8d25e119346f473f723028c17755271a77":"Jack Donovan",
  "c1241d3ef412c47342f23547a85562650f676d3b075728e8df82fcbbe3f13441":"Charlotte Ito",
  "a0647857ff4395f081d20c33c2c91f2cb4d33ad39d9efa821de8d263d455db7b":"Daniel Abebe",
  "1bd20ef6d8691e95d010921f7b04688ed813459d43dd66b09c141f424472abfe":"Grace Sullivan",
  "3f6a19c03196e1f5524b93a4d57d6958944835186c92039c4b4b47bc1004635a":"Samuel Cohen",
  "5db409494cbb79ef62cf37cf9ec21c28f7ca29af3cd50d4607f8742605ba09e4":"Zoe Andersson",
  "deda84cb446f60f6ed3dae02ea7d2783a1e014caeb0b96269b9a376810b08000":"Leo Fischer"
};
// roster = the imported one (localStorage) if present, else the seed
function getRoster(){
  try { const r=JSON.parse(localStorage.getItem("datalab-roster")||"null");
    if(r && typeof r==="object" && Object.keys(r).length) return r; } catch(_){}
  return SEED_ROSTER;
}
function saveRoster(r){ localStorage.setItem("datalab-roster", JSON.stringify(r)); }
// salted SHA-256 → lowercase hex (matches the build-time hashes above)
async function hashPin(pin){
  const data=new TextEncoder().encode(PIN_SALT+":"+pin);
  const buf=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
let currentUser = null;
try { currentUser = JSON.parse(localStorage.getItem("datalab-session") || "null"); } catch(e){ currentUser = null; }
function userKey(){ return currentUser ? currentUser.key : "guest"; }
function progressStoreKey(){ return "datalab-progress::" + userKey(); }

let progress = {};
function loadProgress(){
  try { progress = JSON.parse(localStorage.getItem(progressStoreKey()) || "{}"); } catch(e){ progress = {}; }
}
loadProgress();

function pKey(w,l,t){ return w+"."+l+"."+TIERS[t].key; }
function getProgress(){ return progress[pKey(state.week,state.lesson,state.tier)] || 0; }
function setProgress(v){
  v = Math.max(0, Math.min(100, Math.round(v/5)*5));   // 5% increments only
  progress[pKey(state.week,state.lesson,state.tier)] = v;
  localStorage.setItem(progressStoreKey(), JSON.stringify(progress));
}
function tierProgress(t){ return progress[pKey(state.week,state.lesson,t)] || 0; }

/* ── student code persistence (per user · week · lesson · tier) ── */
let codeStore = {};
function codeStoreKey(){ return "datalab-code::" + userKey(); }
function loadCode(){ try{ codeStore = JSON.parse(localStorage.getItem(codeStoreKey()) || "{}"); }catch(e){ codeStore = {}; } }
function savedCode(){ return codeStore[pKey(state.week,state.lesson,state.tier)]; }
function persistCode(){
  const box=document.getElementById("code-box"); if(!box) return;
  codeStore[pKey(state.week,state.lesson,state.tier)] = box.value;
  try{ localStorage.setItem(codeStoreKey(), JSON.stringify(codeStore)); }catch(e){}
}
function clearSavedCode(){
  delete codeStore[pKey(state.week,state.lesson,state.tier)];
  try{ localStorage.setItem(codeStoreKey(), JSON.stringify(codeStore)); }catch(e){}
}
loadCode();

// a tier unlocks once the previous tier in the same lesson reaches PASS
function tierUnlocked(t){ return t === 0 || tierProgress(t-1) >= PASS; }

/* ══════════════════════════════════════════════════════════════════
   MODULAR TAB SETTERS  (changing a level resets the levels below it)
══════════════════════════════════════════════════════════════════ */
function setWeek(i){ state.week=i; state.lesson=0; state.tier=0; render(); }
function setLesson(i){ state.lesson=i; state.tier=0; render(); }
function setTier(i){ if(!tierUnlocked(i)) return; state.tier=i; render(); }

/* ══════════════════════════════════════════════════════════════════
   TAB BUILDING + keyboard nav
══════════════════════════════════════════════════════════════════ */
const LOCK = '<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';

function buildPillbar(container, items, getActive, onSelect){
  container.addEventListener("keydown", (e) => {
    if(e.key!=="ArrowRight" && e.key!=="ArrowLeft") return;
    e.preventDefault();
    const a=getActive(), n=items.length;
    const nxt = e.key==="ArrowRight" ? (a+1)%n : (a-1+n)%n;
    onSelect(nxt);
    const btn=container.children[nxt]; if(btn) btn.focus();
  });
}
const weeksEl=document.getElementById("weeks");
const lessonsEl=document.getElementById("lessons");
const tiersEl=document.getElementById("tiers");
buildPillbar(weeksEl, CURRICULUM, ()=>state.week, setWeek);
buildPillbar(lessonsEl, [0,1], ()=>state.lesson, setLesson);
buildPillbar(tiersEl, TIERS, ()=>state.tier, setTier);

function renderTabs(){
  // Level 1 · weeks
  weeksEl.innerHTML="";
  CURRICULUM.forEach((wk,i)=>{
    const b=document.createElement("button");
    b.type="button"; b.setAttribute("role","tab");
    b.textContent="Week "+(i+1);
    b.setAttribute("aria-selected", String(i===state.week));
    b.tabIndex = i===state.week?0:-1;
    b.onclick=()=>setWeek(i);
    weeksEl.appendChild(b);
  });
  // Level 2 · lessons (context-sensitive labels)
  lessonsEl.innerHTML="";
  CURRICULUM[state.week].lessons.forEach((ls,i)=>{
    const b=document.createElement("button");
    b.type="button"; b.setAttribute("role","tab");
    b.innerHTML='Lesson '+(i+1)+' <span class="lesson-sub">· '+ls.name+'</span>';
    b.setAttribute("aria-selected", String(i===state.lesson));
    b.tabIndex = i===state.lesson?0:-1;
    b.onclick=()=>setLesson(i);
    lessonsEl.appendChild(b);
  });
  // Level 3 · tiers (locked until previous tier passes)
  tiersEl.innerHTML="";
  TIERS.forEach((tr,i)=>{
    const b=document.createElement("button");
    b.type="button"; b.setAttribute("role","tab");
    const unlocked=tierUnlocked(i);
    b.innerHTML = (unlocked?"":LOCK) + tr.label;
    b.setAttribute("aria-selected", String(i===state.tier));
    if(!unlocked){ b.disabled=true; b.title="Reach "+PASS+"% on "+TIERS[i-1].label+" to unlock"; }
    b.tabIndex = i===state.tier?0:-1;
    b.onclick=()=>setTier(i);
    tiersEl.appendChild(b);
  });
}

/* ══════════════════════════════════════════════════════════════════
   CONTENT HELPERS
══════════════════════════════════════════════════════════════════ */
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function highlightPython(code){
  const KW=/\b(import|from|as|print|def|return|for|in|if|else|and|or|not|True|False|None)\b/g;
  return escapeHtml(code).split("\n").map(line=>{
    let cm=""; const h=line.indexOf("#"); let body=line;
    if(h>-1){ body=line.slice(0,h); cm='<span class="cm">'+line.slice(h)+"</span>"; }
    const strs=[];
    body=body.replace(/(['"])(?:(?!\1).)*\1/g, m=>{ strs.push(m); return "\u0000"+(strs.length-1)+"\u0000"; });
    body=body.replace(KW,'<span class="kw">$1</span>');
    body=body.replace(/\u0000(\d+)\u0000/g,(_,i)=>'<span class="st">'+strs[i]+"</span>");
    return body+cm;
  }).join("\n");
}
// fill {f},{cat},{num},{x},{y} tokens in task text
function fillTokens(str, ds){
  return str.replace(/\{f\}/g,ds.f).replace(/\{cat\}/g,ds.cat)
            .replace(/\{num\}/g,ds.numMain).replace(/\{x\}/g,ds.corrX).replace(/\{y\}/g,ds.corrY);
}
function makeSheet(ds){
  const cols=["A","B","C","D","E","F"].slice(0,ds.headers.length);
  let h='<table class="sheet"><thead><tr><th class="cnr"></th>';
  cols.forEach(c=>h+="<th>"+c+"</th>");
  h+='</tr><tr><th class="rn"></th>';
  ds.headers.forEach(x=>h+="<th>"+escapeHtml(x)+"</th>");
  h+="</tr></thead><tbody>";
  ds.rows.forEach((row,r)=>{
    h+='<tr><td class="rn">'+(r+1)+"</td>";
    row.forEach(cell=>{
      if(cell===null){ h+='<td class="blank"></td>'; return; }
      const flagged=(ds.flagged||[]).includes(cell);
      h+="<td>"+(flagged?'<span class="flag">'+escapeHtml(cell)+"</span>":escapeHtml(cell))+"</td>";
    });
    h+="</tr>";
  });
  return h+"</tbody></table>";
}

/* ══════════════════════════════════════════════════════════════════
   CHART SANDBOX  (knobs + sliders -> live SVG preview)
══════════════════════════════════════════════════════════════════ */
const els = {
  type:document.getElementById("c-type"), bars:document.getElementById("c-bars"),
  color:document.getElementById("c-color"), grid:document.getElementById("c-grid"),
  barsV:document.getElementById("bars-v"), opV:document.getElementById("op-v"), jiV:document.getElementById("ji-v"),
  chart:document.getElementById("chart"), controls:document.getElementById("controls"), sandbox:document.getElementById("sandbox"),
  x:document.getElementById("c-x"), y:document.getElementById("c-y"), bin:document.getElementById("c-bin"),
  binV:document.getElementById("bin-v"), warn:document.getElementById("viz-warn")
};
let dialValues = { opacity:80, jitter:20 };

/* ══════════════════════════════════════════════════════════════════
   MASTER VIZ STUDIO  (Week 1 · Lesson 1 · Master — "The Cartographer")
   A real charting sandbox graded by what the learner builds.
══════════════════════════════════════════════════════════════════ */
function isMasterViz(){ return state.week===0 && state.lesson===0 && state.tier===2; }
let mstate=null;            // tracks achievements during the master viz task
function resetMState(){ mstate={histogramChosen:false,scatterChosen:false,barChosen:false,
  houseOnX:false,sprintOnX:false,typeMismatchSeen:false,scatterMeaningless:false,
  barFour:false,axesLabeled:false,yCount:false,histBinned:false,binAdjusted:false,
  histNoStrings:false,colorChanged:false,certClicked:false}; }
resetMState();

// Week 1 · Lesson 2 · Master ("The Scale Visualizer") — a second live studio
function isScalesViz(){ return state.week===0 && state.lesson===1 && state.tier===2; }
let mstate2=null;
function resetMState2(){ mstate2={barChosen:false,scatterChosen:false,tierOnX:false,
  yCount:false,disorganized:false,rankOnX:false,staircase:false,intTicks:false,
  durationX:false,streamsY:false,cloud:false,colorChanged:false,certClicked:false}; }
resetMState2();
function isLiveViz(){ return isMasterViz()||isScalesViz(); }

// minimal CSV parser for the embedded datasets (for the viz studio)
let vizCache={};
function vizData(name){
  if(vizCache[name]) return vizCache[name];
  let text=""; try{ text=atob(DATASET_B64[name]||""); }catch(_){ }
  const lines=text.split(/\r?\n/).filter(l=>l.length);
  const cols=(lines[0]||"").split(",");
  const rows=lines.slice(1).map(l=>l.split(","));
  // numeric if values parse as numbers (tolerating a trailing unit like the "s"
  // in sprint times, which the learner cleaned in the Craftsman tier)
  const numeric=cols.map((_,i)=>rows.length>0 && rows.every(r=>{
    const v=(r[i]||"").trim(); return v==="" || !isNaN(parseFloat(v)); }) &&
    rows.some(r=>/\d/.test(r[i]||"")));
  const out={cols,rows,numeric};
  vizCache[name]=out; return out;
}

// pure mapping helpers (unit-tested in the build harness)
function pointerToValue(dx,dy){
  const ang = Math.atan2(dx, -dy) * 180/Math.PI;      // 0 = up, +90 = right
  return Math.max(0, Math.min(100, (ang+135)/270*100));
}
function valueToAngle(v){ return -135 + (v/100)*270; } // 0 -> lower-left, 50 -> up, 100 -> lower-right

function makeKnob(svgId, key, valSpan){
  const el=document.getElementById(svgId);
  const ind=el.querySelector(".ind");
  function paint(){
    const v=dialValues[key];
    ind.setAttribute("transform","rotate("+valueToAngle(v)+" 23 23)");
    el.setAttribute("aria-valuenow", v);
    valSpan.textContent=v+"%";
  }
  function setV(v){ dialValues[key]=Math.max(0,Math.min(100,Math.round(v/5)*5)); paint(); drawChart(); }
  let dragging=false;
  function fromEvent(e){
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const pt = e.touches? e.touches[0] : e;
    setV(pointerToValue(pt.clientX-cx, pt.clientY-cy));
  }
  el.addEventListener("pointerdown",e=>{ if(el.dataset.disabled==="true")return; dragging=true; el.setPointerCapture(e.pointerId); fromEvent(e); });
  el.addEventListener("pointermove",e=>{ if(dragging) fromEvent(e); });
  el.addEventListener("pointerup",()=>{ dragging=false; });
  el.addEventListener("keydown",e=>{
    if(el.dataset.disabled==="true")return;
    if(e.key==="ArrowUp"||e.key==="ArrowRight"){ e.preventDefault(); setV(dialValues[key]+5); }
    if(e.key==="ArrowDown"||e.key==="ArrowLeft"){ e.preventDefault(); setV(dialValues[key]-5); }
  });
  paint();
  return { paint };
}
const opacityKnob = makeKnob("k-opacity","opacity",els.opV);
const jitterKnob  = makeKnob("k-jitter","jitter",els.jiV);

function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

function drawChart(){
  if(!els.chart) return;
  if(isMasterViz()){ drawVizChart(); return; }
  if(isScalesViz()){ drawScalesViz(); return; }
  if(els.warn) els.warn.style.display="none";
  const ds = currentDataset();
  const isCap = isCapstone();
  const n=parseInt(els.bars.value,10);
  els.barsV.textContent=n;
  const color = isCap ? els.color.value : cssVar("--accent") || "#1565A8";
  const op = isCap ? dialValues.opacity/100 : 0.9;
  const jit = isCap ? dialValues.jitter/100 : 0;
  const type = isCap ? els.type.value : "Bar";
  const W=320,H=150,pad=14,base=H-pad;
  const seed=(state.week+1)*7+state.lesson*3+state.tier;
  let vals;
  if(liveVals && liveVals.length){
    // scale the real loaded values into the drawing area
    const src=liveVals.slice(0,n);
    const mx=Math.max(...src), mn=Math.min(...src), rng=(mx-mn)||1;
    vals=src.map((raw,i)=>{
      const j = jit ? (Math.sin(seed*3+i*5.1)*jit*30) : 0;
      return Math.max(8, Math.min(base-12, 12 + (raw-mn)/rng*(base-32) + j));
    });
  } else {
    vals=Array.from({length:n},(_,i)=>{
      const j = jit ? (Math.sin(seed*3+i*5.1)*jit*30) : 0;
      return Math.max(8, Math.min(base-12, 22 + Math.abs(Math.sin(seed+i*1.3))*(base-40) + j));
    });
  }
  let parts=[];
  if(isCap && els.grid.checked){
    for(let g=1;g<4;g++){ const y=pad+(base-pad)*g/4; parts.push('<line class="axis" x1="'+pad+'" y1="'+y.toFixed(1)+'" x2="'+(W-pad)+'" y2="'+y.toFixed(1)+'" stroke-opacity="0.4"/>'); }
  }
  parts.push('<line class="axis" x1="'+pad+'" y1="'+base+'" x2="'+(W-pad)+'" y2="'+base+'"/>');
  if(type==="Bar"){
    const gap=(W-pad*2)/n, bw=gap*0.64;
    vals.forEach((v,i)=>{ const x=pad+i*gap+(gap-bw)/2;
      parts.push('<rect x="'+x.toFixed(1)+'" y="'+(base-v).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+v.toFixed(1)+'" rx="2" fill="'+color+'" fill-opacity="'+op+'"/>'); });
  } else if(type==="Line"){
    const gap=(W-pad*2)/(n-1);
    const pts=vals.map((v,i)=>(pad+i*gap).toFixed(1)+","+(base-v).toFixed(1)).join(" ");
    parts.push('<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-opacity="'+op+'" stroke-linejoin="round"/>');
    vals.forEach((v,i)=>parts.push('<circle cx="'+(pad+i*gap).toFixed(1)+'" cy="'+(base-v).toFixed(1)+'" r="3" fill="'+color+'"/>'));
  } else {
    const gap=(W-pad*2)/n;
    vals.forEach((v,i)=>{ const x=pad+i*gap+gap/2;
      parts.push('<circle cx="'+x.toFixed(1)+'" cy="'+(base-v).toFixed(1)+'" r="4.5" fill="'+color+'" fill-opacity="'+op+'"/>'); });
  }
  const lbl = isCap ? ds.corrX : (liveVals && liveVals.length ? ds.numMain : "preview");
  parts.push('<text class="lbl" x="'+pad+'" y="'+(H-3)+'">'+escapeHtml(lbl)+"</text>");
  els.chart.innerHTML=parts.join("");
}
// Real, data-driven chart for the Master viz studio (sports_day.csv)
function drawVizChart(){
  const data=vizData("sports_day.csv");
  const cols=data.cols, rows=data.rows;
  const xName=els.x.value, yName=els.y.value, type=els.type.value;
  const xi=cols.indexOf(xName), yi=cols.indexOf(yName);
  const xNum=xi>=0 && data.numeric[xi];
  const color=els.color.value||cssVar("--accent");
  const op=dialValues.opacity/100;
  const W=320,H=150,padL=22,padB=20,pad=10,base=H-padB;
  let parts=[], warn="";

  // record selections as achievements
  if(type==="Histogram") mstate.histogramChosen=true;
  if(type==="Scatter") mstate.scatterChosen=true;
  if(type==="Bar") mstate.barChosen=true;
  if(/house/i.test(xName)) mstate.houseOnX=true;
  if(/sprint/i.test(xName)) mstate.sprintOnX=true;
  if(/^count$/i.test(yName)) mstate.yCount=true;

  function axisLabels(xl,yl){
    parts.push('<text class="lbl" x="'+(W/2)+'" y="'+(H-4)+'" text-anchor="middle">'+escapeHtml(xl)+"</text>");
    parts.push('<text class="lbl" x="6" y="12">'+escapeHtml(yl)+"</text>");
    mstate.axesLabeled=true;
  }
  parts.push('<line class="axis" x1="'+padL+'" y1="'+base+'" x2="'+(W-pad)+'" y2="'+base+'"/>');
  parts.push('<line class="axis" x1="'+padL+'" y1="'+pad+'" x2="'+padL+'" y2="'+base+'"/>');

  if(type==="Histogram"){
    if(xNum){                                   // correct: continuous on a histogram
      const vals=rows.map(r=>parseFloat(r[xi])).filter(v=>!isNaN(v));
      const bw=parseFloat(els.bin.value)||0.5;
      const mn=Math.min(...vals), mx=Math.max(...vals);
      const nb=Math.max(1,Math.ceil((mx-mn)/bw));
      const bins=new Array(nb).fill(0);
      vals.forEach(v=>{ let b=Math.floor((v-mn)/bw); if(b>=nb)b=nb-1; bins[b]++; });
      const maxC=Math.max(...bins,1), gap=(W-padL-pad)/nb;
      bins.forEach((c,i)=>{ const h=(c/maxC)*(base-pad); const x=padL+i*gap;
        parts.push('<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+(gap*0.92).toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+color+'" fill-opacity="'+op+'"/>'); });
      axisLabels(xName+" ("+bw+"s bins)","Frequency");
      mstate.histBinned=true; mstate.histNoStrings=true;
    } else {                                     // the intentional error
      warn="⚠ Type Mismatch: '"+xName+"' is qualitative text — it can't be distributed on a continuous histogram.";
      mstate.typeMismatchSeen=true;
    }
  } else if(type==="Bar"){
    // value counts of a categorical column
    const counts={};
    rows.forEach(r=>{ const k=(r[xi]||"").trim(); if(k) counts[k]=(counts[k]||0)+1; });
    const keys=Object.keys(counts);
    if(keys.length){
      const maxC=Math.max(...Object.values(counts)), gap=(W-padL-pad)/keys.length;
      const houseColors={Red:"#C0392B",Blue:"#2471A3",Green:"#229954",Yellow:"#D4AC0D"};
      keys.forEach((k,i)=>{ const h=(counts[k]/maxC)*(base-pad); const x=padL+i*gap+gap*0.1;
        const fill=(mstate.colorChanged && houseColors[k])?houseColors[k]:color;
        parts.push('<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+(gap*0.8).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+fill+'" fill-opacity="'+op+'"/>');
        parts.push('<text class="lbl" x="'+(x+gap*0.4).toFixed(1)+'" y="'+(base+9)+'" text-anchor="middle">'+escapeHtml(k.slice(0,6))+"</text>"); });
      axisLabels(xName, /count/i.test(yName)?"Count":yName);
      if(!data.numeric[xi] && keys.length===4) mstate.barFour=true;
    }
  } else { // Scatter / Line
    const yiu=yi>=0?yi:xi;
    const xv=rows.map(r=>parseFloat(r[xi])), yv=rows.map(r=>parseFloat(r[yiu]));
    const okx=data.numeric[xi], oky=data.numeric[yiu];
    if(!okx){ // plotting text on a scatter → meaningless grid
      mstate.scatterMeaningless = mstate.scatterMeaningless || (/house/i.test(xName) && /student/i.test(yName));
      warn="⚠ '"+xName+"' is text — the scatter is a meaningless grid of dots.";
    }
    const xs=xv.map(v=>isNaN(v)?Math.random():v), ys=yv.map(v=>isNaN(v)?Math.random():v);
    const xmn=Math.min(...xs),xmx=Math.max(...xs),ymn=Math.min(...ys),ymx=Math.max(...ys);
    const sx=v=>padL+((v-xmn)/((xmx-xmn)||1))*(W-padL-pad);
    const sy=v=>base-((v-ymn)/((ymx-ymn)||1))*(base-pad);
    xs.forEach((v,i)=>parts.push('<circle cx="'+sx(v).toFixed(1)+'" cy="'+sy(ys[i]).toFixed(1)+'" r="2.2" fill="'+color+'" fill-opacity="'+(op*0.7)+'"/>'));
    axisLabels(xName,yName);
  }

  if(els.warn){ els.warn.style.display=warn?"flex":"none"; els.warn.textContent=warn; }
  els.chart.innerHTML=parts.join("");
}

["change","input"].forEach(ev=>{
  els.type.addEventListener(ev,onVizControl); els.bars.addEventListener(ev,drawChart);
  els.color.addEventListener(ev,onVizControl); els.grid.addEventListener(ev,drawChart);
  els.x.addEventListener(ev,onVizControl); els.y.addEventListener(ev,onVizControl);
  els.bin.addEventListener(ev,onVizControl);
});
function onVizControl(e){
  if(e && e.target===els.color){ mstate.colorChanged=true; mstate2.colorChanged=true; }
  if(e && e.target===els.bin){ els.binV.textContent=els.bin.value; if(parseFloat(els.bin.value)!==0.5) mstate.binAdjusted=true; }
  drawChart();
  if(isLiveViz() && typeof evaluateChecks==="function") evaluateChecks();
}
// populate the X/Y axis selectors for the viz studio
function populateVizAxes(){
  const data=vizData("sports_day.csv");
  if(els.x.options.length!==data.cols.length){
    els.x.innerHTML=data.cols.map(c=>'<option>'+escapeHtml(c)+"</option>").join("");
  }
  if(!els.y.options.length){
    els.y.innerHTML=['Count'].concat(data.cols).map(c=>'<option>'+escapeHtml(c)+"</option>").join("");
  }
}

// Real, data-driven chart for the Scale studio (spotify_tracks.csv)
function drawScalesViz(){
  const data=vizData("spotify_tracks.csv");
  const cols=data.cols, rows=data.rows;
  const xName=els.x.value, yName=els.y.value, type=els.type.value;
  const color=els.color.value||cssVar("--accent");
  const op=dialValues.opacity/100;
  const W=320,H=150,padL=24,padB=20,pad=10,base=H-padB;
  let parts=[], warn="";
  const m=mstate2;
  const tierIdx=cols.findIndex(c=>/popularity|tier/i.test(c));
  const rankMap={Bronze:1,Silver:2,Gold:3,Platinum:4};
  const tierColors={Bronze:"#CD7F32",Silver:"#C0C0C0",Gold:"#D4AF37",Platinum:"#7DF9FF"};
  const isRankAxis=/tier rank|mapped|rank/i.test(xName);

  if(type==="Bar") m.barChosen=true;
  if(type==="Scatter"||type==="Line") m.scatterChosen=true;

  function axisLabels(xl,yl){
    parts.push('<text class="lbl" x="'+(W/2)+'" y="'+(H-4)+'" text-anchor="middle">'+escapeHtml(xl)+"</text>");
    parts.push('<text class="lbl" x="6" y="12">'+escapeHtml(yl)+"</text>");
  }
  parts.push('<line class="axis" x1="'+padL+'" y1="'+base+'" x2="'+(W-pad)+'" y2="'+base+'"/>');
  parts.push('<line class="axis" x1="'+padL+'" y1="'+pad+'" x2="'+padL+'" y2="'+base+'"/>');

  if(type==="Bar"){
    m.yCount = m.yCount || /count/i.test(yName);
    if(isRankAxis){                                   // mapped ranks → ordered staircase
      const counts={1:0,2:0,3:0,4:0};
      rows.forEach(r=>{ const t=(r[tierIdx]||"").trim(); if(rankMap[t]) counts[rankMap[t]]++; });
      const order=[1,2,3,4], maxC=Math.max(...order.map(k=>counts[k]),1), gap=(W-padL-pad)/4;
      const nameByRank={1:"Bronze",2:"Silver",3:"Gold",4:"Platinum"};
      order.forEach((k,i)=>{ const h=(counts[k]/maxC)*(base-pad); const x=padL+i*gap+gap*0.1;
        const fill=(m.colorChanged)?tierColors[nameByRank[k]]:color;
        parts.push('<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+(gap*0.8).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+fill+'" fill-opacity="'+op+'"/>');
        parts.push('<text class="lbl" x="'+(x+gap*0.4).toFixed(1)+'" y="'+(base+9)+'" text-anchor="middle">'+k+"</text>"); });
      axisLabels("Tier Rank (1→4)", /count/i.test(yName)?"Count":yName);
      m.rankOnX=true; m.staircase=true; m.intTicks=true;
    } else if(tierIdx>=0 && /popularity|tier/i.test(xName)){  // raw text → alphabetical (broken)
      const counts={}; rows.forEach(r=>{ const t=(r[tierIdx]||"").trim(); if(t) counts[t]=(counts[t]||0)+1; });
      const keys=["Bronze","Gold","Platinum","Silver"].filter(k=>counts[k]);
      const maxC=Math.max(...keys.map(k=>counts[k]),1), gap=(W-padL-pad)/Math.max(keys.length,1);
      keys.forEach((k,i)=>{ const h=(counts[k]/maxC)*(base-pad); const x=padL+i*gap+gap*0.1;
        const fill=(m.colorChanged)?tierColors[k]:color;
        parts.push('<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+(gap*0.8).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+fill+'" fill-opacity="'+op+'"/>');
        parts.push('<text class="lbl" x="'+(x+gap*0.4).toFixed(1)+'" y="'+(base+9)+'" text-anchor="middle">'+escapeHtml(k.slice(0,4))+"</text>"); });
      axisLabels(xName+" (A→Z)", /count/i.test(yName)?"Count":yName);
      m.tierOnX=true; if(keys.length===4) m.disorganized=true;
      warn="⚠ Alphabetical order (B, G, P, S) is NOT the rank order — this chart is misleading.";
    } else {                                          // any other categorical column
      const idx=cols.indexOf(xName), counts={};
      rows.forEach(r=>{ const k=(r[idx]||"").trim(); if(k) counts[k]=(counts[k]||0)+1; });
      const keys=Object.keys(counts).slice(0,12), maxC=Math.max(...keys.map(k=>counts[k]),1), gap=(W-padL-pad)/Math.max(keys.length,1);
      keys.forEach((k,i)=>{ const h=(counts[k]/maxC)*(base-pad); const x=padL+i*gap+gap*0.1;
        parts.push('<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+(gap*0.8).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+color+'" fill-opacity="'+op+'"/>'); });
      axisLabels(xName, /count/i.test(yName)?"Count":yName);
    }
  } else {                                             // Scatter / Line → cardinal cloud
    const xi=cols.indexOf(xName), yi=cols.indexOf(yName);
    if(/duration/i.test(xName)) m.durationX=true;
    if(/stream/i.test(yName)) m.streamsY=true;
    const xv=rows.map(r=>parseFloat(r[xi])), yv=rows.map(r=>parseFloat(r[yi>=0?yi:xi]));
    const pairs=xv.map((v,i)=>[v,yv[i]]).filter(p=>!isNaN(p[0])&&!isNaN(p[1]));
    if(pairs.length){
      const xs=pairs.map(p=>p[0]), ys=pairs.map(p=>p[1]);
      const xmn=Math.min(...xs),xmx=Math.max(...xs),ymn=Math.min(...ys),ymx=Math.max(...ys);
      const sx=v=>padL+((v-xmn)/((xmx-xmn)||1))*(W-padL-pad);
      const sy=v=>base-((v-ymn)/((ymx-ymn)||1))*(base-pad);
      pairs.forEach(p=>parts.push('<circle cx="'+sx(p[0]).toFixed(1)+'" cy="'+sy(p[1]).toFixed(1)+'" r="2.2" fill="'+color+'" fill-opacity="'+(op*0.7)+'"/>'));
      if(pairs.length>50) m.cloud=true;
    }
    axisLabels(xName,yName);
  }

  if(els.warn){ els.warn.style.display=warn?"flex":"none"; els.warn.textContent=warn; }
  els.chart.innerHTML=parts.join("");
}

// populate the X/Y axis selectors for the scale studio (adds a synthetic mapped-rank axis)
function populateScalesAxes(){
  const data=vizData("spotify_tracks.csv");
  const want=data.cols.length+1;
  if(els.x.options.length!==want){
    els.x.innerHTML=data.cols.concat(["Tier Rank (mapped)"]).map(c=>'<option>'+escapeHtml(c)+"</option>").join("");
  }
  if(els.y.options.length!==data.cols.length+1){
    els.y.innerHTML=['Count'].concat(data.cols).map(c=>'<option>'+escapeHtml(c)+"</option>").join("");
  }
}

/* ══════════════════════════════════════════════════════════════════
   CURRENT-LESSON RESOLUTION
══════════════════════════════════════════════════════════════════ */
function currentLesson(){ return CURRICULUM[state.week].lessons[state.lesson]; }
function isCapstone(){ return !!currentLesson().choices; }
function currentDatasetName(){ return isCapstone() ? state.capstone : currentLesson().ds; }
function currentDataset(){
  const name=currentDatasetName();
  return Object.assign({ f:name }, DATASETS[name]);
}

/* ══════════════════════════════════════════════════════════════════
   MASTERY BAR RENDER
══════════════════════════════════════════════════════════════════ */
const segTrack=document.getElementById("seg-track");
const mPct=document.getElementById("m-pct");
const mBadge=document.getElementById("m-badge");
const mTitle=document.getElementById("m-title");
const mHint=document.getElementById("m-hint");

// build 20 segment cells once
for(let i=0;i<20;i++){
  const s=document.createElement("div");
  s.className="seg"; s.dataset.idx=i;
  s.onclick=()=>{ setProgress((i+1)*5); render(); };
  segTrack.appendChild(s);
}
document.getElementById("step-btn").onclick=()=>{ setProgress(getProgress()+5); render(); };
document.getElementById("reset-btn").onclick=()=>{ setProgress(0); render(); };
segTrack.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"){ e.preventDefault(); setProgress(getProgress()+5); render(); }
  if(e.key==="ArrowLeft"){ e.preventDefault(); setProgress(getProgress()-5); render(); }
});

function renderMastery(){
  const v=getProgress();
  mPct.textContent=v+"%";
  segTrack.setAttribute("aria-valuenow",v);
  [...segTrack.children].forEach((s,i)=>{
    s.classList.toggle("on",(i+1)*5<=v);
    s.classList.toggle("threshold",(i+1)*5===PASS);
  });
  mTitle.textContent = TIERS[state.tier].label+" task";
  const passed = v>=PASS;
  mBadge.classList.toggle("passed",passed);
  if(passed){
    mBadge.textContent = state.tier<2 ? "✓ Passed — next tier unlocked" : "✓ Mastered";
    mHint.textContent = state.tier<2 ? "Great — the "+TIERS[state.tier+1].label+" tier is now open." : "You can submit your project for a lab report.";
  } else {
    mBadge.textContent="In progress";
    mHint.textContent="Reach "+PASS+"% to "+(state.tier<2?"unlock the "+TIERS[state.tier+1].label+" tier.":"submit your project.");
  }
}

/* ══════════════════════════════════════════════════════════════════
   MASTER RENDER
══════════════════════════════════════════════════════════════════ */
function render(){
  const lesson=currentLesson();
  const topic=TOPICS[lesson.topic];
  const ds=currentDataset();
  const tierKey=TIERS[state.tier].key;

  renderTabs();
  renderMastery();

  // breadcrumb + dataset chip
  document.getElementById("crumb").innerHTML =
    "<b>Week "+(state.week+1)+"</b> "+escapeHtml(CURRICULUM[state.week].title)+
    "<span class='sep'>/</span><b>Lesson "+(state.lesson+1)+"</b> "+escapeHtml(lesson.name)+
    "<span class='sep'>/</span><b>"+TIERS[state.tier].label+"</b>";
  document.getElementById("ds-chip").textContent=ds.f;

  // capstone dataset chooser
  const capPick=document.getElementById("capstone-pick");
  if(isCapstone()){
    capPick.style.display="flex";
    capPick.querySelectorAll("button").forEach(b=>b.remove());
    lesson.choices.forEach(name=>{
      const b=document.createElement("button");
      b.type="button"; b.textContent=name;
      b.setAttribute("aria-pressed", String(name===state.capstone));
      b.onclick=()=>{ state.capstone=name; render(); };
      capPick.appendChild(b);
    });
  } else { capPick.style.display="none"; }

  // task text
  document.getElementById("task").innerHTML =
    "<b>Your task:</b> "+fillTokens(topic.task[tierKey], ds);

  // panels
  document.getElementById("de-meta").textContent=ds.f;
  document.getElementById("data-engine").innerHTML=makeSheet(ds);
  starterCode = topic.code(ds)[tierKey];
  const _saved = savedCode();
  document.getElementById("code-box").value = (_saved != null && _saved !== "") ? _saved : starterCode;
  if(typeof syncHL==="function") syncHL();
  liveVals = null;
  // reset auto-grader state for the newly selected lesson/tier
  lastRun = null; flaggedCols.clear(); resetMState(); resetMState2();
  const graded = isGradedLesson();
  document.getElementById("step-btn").style.display = graded ? "none" : "";
  if(typeof evaluateChecks==="function") evaluateChecks();
  document.getElementById("terminal").innerHTML =
    '<span class="p">&gt;&gt;&gt;</span> <span class="dim"># Press ▶ Run to execute this code against the real '+escapeHtml(ds.f)+'</span>';
  document.getElementById("cs-meta").textContent = isCapstone()? "all dials unlocked" : ds.corrY+" vs "+ds.corrX;

  // sandbox lock state (unlocked in the capstone AND the W1L1 Master viz studio)
  const viz=isMasterViz(), sviz=isScalesViz();
  const unlocked=isCapstone()||viz||sviz;
  els.controls.dataset.locked=String(!unlocked);
  els.sandbox.dataset.locked=String(!unlocked);
  els.sandbox.classList.toggle("viz",viz||sviz);
  [els.type,els.bars,els.color,els.grid,els.x,els.y,els.bin].forEach(c=>c.disabled=!unlocked);
  document.getElementById("k-opacity").dataset.disabled=String(!unlocked);
  document.getElementById("k-jitter").dataset.disabled=String(!unlocked);
  if(viz){ populateVizAxes(); els.binV.textContent=els.bin.value;
    document.getElementById("cs-meta").textContent="viz studio · graded"; }
  if(sviz){ populateScalesAxes(); els.binV.textContent=els.bin.value;
    document.getElementById("cs-meta").textContent="scale studio · graded"; }

  if(typeof clearChartImg==="function") clearChartImg();
  drawChart();
  maybeShowCertButton();
}

/* ══════════════════════════════════════════════════════════════════
   CERTIFICATE  (Master tier · "Submit Project & Print Lab Report")
══════════════════════════════════════════════════════════════════ */
let certBtn=null;
function maybeShowCertButton(){
  // The button lives in the mastery controls and only appears on the Master tier
  if(certBtn){ certBtn.remove(); certBtn=null; }
  if(TIERS[state.tier].key!=="master") return;
  certBtn=document.createElement("button");
  certBtn.className="btn primary";
  certBtn.id="submit-btn";
  certBtn.textContent="🎓 Submit Project & Print Lab Report";
  const passed=getProgress()>=PASS;
  certBtn.disabled=!passed;
  certBtn.title = passed ? "Generate a parent-facing lab report" : "Reach "+PASS+"% first";
  certBtn.onclick=openCertificate;
  document.querySelector(".mastery-controls").appendChild(certBtn);
}

const overlay=document.getElementById("overlay");
function openCertificate(){
  if(isMasterViz()){ mstate.certClicked=true; if(typeof evaluateChecks==="function") evaluateChecks(); }
  if(isScalesViz()){ mstate2.certClicked=true; if(typeof evaluateChecks==="function") evaluateChecks(); }
  const lesson=currentLesson(), topic=TOPICS[lesson.topic], ds=currentDataset();
  // populate
  document.getElementById("cert-week").textContent="Week "+(state.week+1)+" · Lesson "+(state.lesson+1);
  document.getElementById("cert-topic").textContent=lesson.name;
  document.getElementById("cert-ds").textContent=ds.f;
  document.getElementById("cert-score").textContent=getProgress()+"% · Master tier";
  document.getElementById("cert-date").textContent=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const ul=document.getElementById("cert-skills"); ul.innerHTML="";
  topic.skills.forEach(s=>{ const li=document.createElement("li"); li.textContent=s; ul.appendChild(li); });
  const nameInput=document.getElementById("cert-name");
  nameInput.value=localStorage.getItem("datalab-name")||"Student Name";
  document.getElementById("cert-name-wrap").setAttribute("data-name", nameInput.value);
  nameInput.oninput=()=>{ localStorage.setItem("datalab-name",nameInput.value); document.getElementById("cert-name-wrap").setAttribute("data-name",nameInput.value); };

  // show overlay with a brief "generating" simulation
  overlay.classList.add("show");
  document.getElementById("cert-gen").style.display="block";
  document.getElementById("cert-wrap").style.display="none";
  setTimeout(()=>{
    document.getElementById("cert-gen").style.display="none";
    document.getElementById("cert-wrap").style.display="block";
  }, 700);
}
document.getElementById("cert-close").onclick=()=>overlay.classList.remove("show");
document.getElementById("cert-print").onclick=()=>window.print();
overlay.addEventListener("click",e=>{ if(e.target===overlay) overlay.classList.remove("show"); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape") overlay.classList.remove("show"); });

/* ══════════════════════════════════════════════════════════════════
   FULLSCREEN PANEL TOGGLE
══════════════════════════════════════════════════════════════════ */
function toggleDev(){
  const on=document.body.classList.toggle("dev-mode");
  const btn=document.getElementById("dev-toggle");
  btn.innerHTML = on ? "&#10005; Dev mode" : "&lt;/&gt; Dev mode";
  // exit any fullscreen panel so the two-pane view lays out cleanly
  document.querySelectorAll(".panel.full").forEach(p=>p.classList.remove("full"));
  document.body.classList.remove("has-full");
  drawChart();
}
function toggleFull(btn){
  const panel=btn.closest(".panel");
  const goingFull=!panel.classList.contains("full");
  // only one panel full at a time
  document.querySelectorAll(".panel.full").forEach(p=>{ if(p!==panel) p.classList.remove("full"); });
  panel.classList.toggle("full", goingFull);
  document.body.classList.toggle("has-full", goingFull);
  btn.textContent = goingFull ? "🗗" : "⛶";
  btn.title = goingFull ? "Exit fullscreen" : "Toggle fullscreen";
  drawChart();
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    const p=document.querySelector(".panel.full");
    if(p){ p.classList.remove("full"); document.body.classList.remove("has-full");
      const b=p.querySelector(".panel-btn"); if(b){ b.textContent="⛶"; b.title="Toggle fullscreen"; } drawChart(); }
  }
});

/* ══════════════════════════════════════════════════════════════════
   LIVE CODE ENGINE  (Pyodide · pandas · matplotlib)
══════════════════════════════════════════════════════════════════ */
let starterCode="";
let liveVals=null;
let lastRun=null;                 // facts from the most recent run, for the grader
const flaggedCols=new Set();      // columns the learner highlighted in the Data Engine

/* ══════════════════════════════════════════════════════════════════
   AUTOMATIC CHECKER — Week 1 · Lesson 1 · Apprentice ("Type Detective")
   20 checks; 80% (16/20) needed, which unlocks the next tier.
══════════════════════════════════════════════════════════════════ */
function gradeKey(){ return state.week+"."+state.lesson+"."+state.tier; }
function isGradedLesson(){ return !!GRADERS[gradeKey()]; }

// pull every number out of terminal text, to verify printed statistics
function outNums(s){ return (String(s).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number); }
function hasNear(nums,target,tol){ return target!=null && nums.some(n=>Math.abs(n-target)<=tol); }

function computeTypeChecks(r){
  const code=r.code||"", cl=code.toLowerCase();
  const out=r.stdout||"", ol=out.toLowerCase();
  const err=r.err||"", allOut=out+"\n"+err;
  const cols=r.cols||[], dt=r.dtypes||{}, shape=r.shape||[0,0];
  const find=re=>cols.find(c=>re.test(c));
  const sprintCol=find(/sprint/i), houseCol=find(/house/i),
        ageCol=cols.find(c=>/^age$/i.test(c))||find(/age/i),
        jumpCol=find(/jump/i);
  const dtype=c=>c?(dt[c]||""):"";
  const sprintObj=/object/.test(dtype(sprintCol));
  const origCols=["Student ID","House","Age","Events Entered","100m Sprint Time (seconds)","High Jump (meters)"];
  const colsIntact=shape[1]===6 && origCols.every(c=>cols.includes(c));

  return [
    // Phase 1 · Syntax & Initialisation
    {t:"Imported the pandas library", ok:/import\s+pandas/.test(cl)},
    {t:"Loaded sports_day.csv into a DataFrame", ok:/read_csv\s*\(\s*['"][^'"]*sports_day\.csv/.test(cl)},
    {t:"Assigned it to a variable (e.g. df)", ok:/\b[\w]+\s*=\s*[\w.]*read_csv\s*\(/.test(code)},
    {t:"Code ran without a syntax error", ok:r.ran && !/SyntaxError|IndentationError/.test(err)},
    {t:"Data Engine rendered all 250 rows", ok:shape[0]===250},
    // Phase 2 · Type Extraction
    {t:"Used .dtypes or .info() to inspect types", ok:/\.dtypes\b/.test(cl)||/\.info\s*\(/.test(cl)},
    {t:"Printed the type check to the terminal", ok:/(int64|float64|object|dtype)/i.test(out)},
    {t:"House identified as object / string", ok:/object/.test(dtype(houseCol))},
    {t:"Age identified as int64 (discrete)", ok:/int64/.test(dtype(ageCol))},
    {t:"High Jump identified as float64 (continuous)", ok:/float64/.test(dtype(jumpCol))},
    // Phase 3 · The Trap
    {t:"Checked the type of 100m Sprint Time", ok:/sprint/i.test(code)},
    {t:"Terminal shows Sprint Time is an object", ok:sprintObj && /object/i.test(out)},
    {t:"Wrote a maths test on Sprint (e.g. .mean())", ok:/\.mean\s*\(/.test(code) && /sprint/i.test(code)},
    {t:"A TypeError was raised as expected", ok:/typeerror/i.test(allOut)},
    {t:"Highlighted the Sprint column red in the grid", ok:!!sprintCol && flaggedCols.has(sprintCol)},
    // Phase 4 · Output & Completion
    {t:"Grid free of accidental edits", ok:shape[0]===250 && shape[1]===6},
    {t:"All 6 original columns intact", ok:colsIntact},
    {t:"All 250 original rows intact", ok:shape[0]===250},
    {t:'Printed "Qualitative" for House', ok:/qualitative/i.test(out)},
    {t:'Printed "Quantitative" for Age', ok:/quantitative/i.test(out)},
  ];
}

// Week 1 · Lesson 1 · Craftsman ("The Sanitiser") — clean + cast + verify
function computeCleanChecks(r){
  const code=r.code||"", cl=code.toLowerCase();
  const out=r.stdout||"", err=r.err||"", allOut=out+"\n"+err;
  const cols=r.cols||[], dt=r.dtypes||{}, shape=r.shape||[0,0];
  const sp=r.sprint||{}, nums=outNums(out);
  const find=re=>cols.find(c=>re.test(c));
  const sprintCol=find(/sprint/i), houseCol=find(/house/i),
        ageCol=cols.find(c=>/^age$/i.test(c))||find(/age/i);
  const dtype=c=>c?(dt[c]||""):"";
  const sprintRef=/\[\s*['"][^'"]*sprint[^'"]*['"]\s*\]/i.test(code) || /sprint/i.test(code);
  const sprintFloat=/float/.test(sp.dtype||"");
  const lowNaN=(sp.nan!=null) && (sp.nan<=(sp.truth_nan!=null?sp.truth_nan:0)+1);

  return [
    // Phase 1 · Target Isolation & String Slicing
    {t:"References the 100m Sprint Time column", ok:sprintRef},
    {t:"Calls a string replace/slice (.str.replace …)", ok:/\.str\.(replace|slice|strip|extract)\s*\(/i.test(code)||/\.str\[/.test(code)},
    {t:'Targets the lowercase "s" character', ok:/replace\s*\(\s*['"]s['"]/i.test(code)},
    {t:"Cleans without deleting the numeric values", ok:sprintFloat && lowNaN},
    {t:"No KeyError (column name spelled correctly)", ok:!/keyerror/i.test(allOut)},
    // Phase 2 · Type Casting
    {t:"Applied .astype() to the cleaned column", ok:/\.astype\s*\(/i.test(code)},
    {t:"Cast to float (not int)", ok:/astype\s*\(\s*['"]?float/i.test(code) && !/astype\s*\(\s*['"]?int\b/i.test(code)},
    {t:"Saved back to a column (not just printed)", ok:/df\s*\[[^\]]+\]\s*=/.test(code)},
    {t:"Terminal confirms the new type is float64", ok:/float64/i.test(out)},
    {t:'The "s" vanished from the Data Engine grid', ok:sprintFloat},
    // Phase 3 · Mathematical Verification
    {t:"Calculated the mean of the cleaned column", ok:/\.mean\s*\(/.test(code) && sprintRef},
    {t:"Mean ran without the previous TypeError", ok:sprintFloat && !/typeerror/i.test(allOut)},
    {t:"Average is accurate (~"+(sp.truth_mean!=null?sp.truth_mean.toFixed(1):"14.5")+"s)", ok:hasNear(nums,sp.truth_mean,0.3)},
    {t:"Printed the maximum sprint time (.max())", ok:/\.max\s*\(/.test(code) && hasNear(nums,sp.truth_max,0.2)},
    {t:"Printed the minimum sprint time (.min())", ok:/\.min\s*\(/.test(code) && hasNear(nums,sp.truth_min,0.2)},
    // Phase 4 · Data Engine Integrity
    {t:"Still exactly 250 rows after the transform", ok:shape[0]===250},
    {t:"No accidental NaN introduced in valid rows", ok:lowNaN},
    {t:"House & Age kept their original types", ok:/object/.test(dtype(houseCol)) && /int64/.test(dtype(ageCol))},
    {t:"Ran a final df.dtypes to show a clean board", ok:/\.dtypes\b/.test(cl) && /float64/i.test(out)},
    {t:"Output is free of red error logs", ok:!err.trim()},
  ];
}

// Week 1 · Lesson 1 · Master ("The Cartographer") — graded from the viz studio
function computeVizChecks(r){
  const m=mstate||{}, err=(r&&r.err)||"";
  const codeClean = !/SyntaxError|IndentationError/.test(err);
  const allTiersDone = tierProgress(0)>=PASS && tierProgress(1)>=PASS;
  return [
    // Phase 1 · The Intentional Error
    {t:'Selected "Histogram" in the Chart Sandbox', ok:m.histogramChosen},
    {t:"Put the qualitative House column on the X-axis", ok:m.houseOnX},
    {t:'Triggered the "Type Mismatch" warning', ok:m.typeMismatchSeen},
    {t:'Selected "Scatter Plot" from the dropdown', ok:m.scatterChosen},
    {t:"Plotted House vs Student ID (meaningless grid)", ok:m.scatterMeaningless},
    // Phase 2 · The Qualitative Correction
    {t:'Changed the chart type to "Bar Chart"', ok:m.barChosen},
    {t:"X-axis correctly set to a qualitative column", ok:m.houseOnX},
    {t:"Y-axis set to a Count aggregation", ok:m.yCount},
    {t:"Rendered 4 distinct House bars", ok:m.barFour},
    {t:"X and Y axes are labelled", ok:m.axesLabeled},
    // Phase 3 · The Quantitative Correction
    {t:'Switched back to "Histogram"', ok:m.histogramChosen},
    {t:"Put continuous Sprint Time on the X-axis", ok:m.sprintOnX},
    {t:"Histogram bins the float decimals", ok:m.histBinned},
    {t:"Used the bin-size slider for readable bins", ok:m.binAdjusted},
    {t:"Histogram is free of qualitative strings", ok:m.histNoStrings},
    // Phase 4 · UI Polish & Printout
    {t:"Used the colour picker to recolour the bars", ok:m.colorChanged},
    {t:"Code Box is free of syntax errors", ok:codeClean},
    {t:"Data Engine synced with the Sandbox inputs", ok:true},
    {t:'Clicked "Generate Lab Report"', ok:m.certClicked},
    {t:"100% across typing, cleaning & visual mapping", ok:allTiersDone && m.barFour && m.histBinned},
  ];
}

// Week 1 · Lesson 2 · Apprentice ("The Alphabetical Trap") — sort cardinal vs ordinal
function computeScaleSortChecks(r){
  const code=r.code||"", cl=code.toLowerCase();
  const out=r.stdout||"", err=r.err||"", allOut=out+"\n"+err;
  const cols=r.cols||[], shape=r.shape||[0,0], sc=r.scales||{};
  const nums=outNums(out);
  const orig=["Song Title","Artist","Genre","Release Date","Total Streams","Tempo (BPM)","Song Duration (seconds)","Popularity Tier"];
  const colsIntact=shape[1]===8 && orig.every(c=>cols.includes(c));
  // alphabetical proof: the four tiers appear in B < G < P < S order in the output
  const ib=out.indexOf("Bronze"), ig=out.indexOf("Gold"), ip=out.indexOf("Platinum"), is=out.indexOf("Silver");
  const seqAlpha = ib>=0 && ig>ib && ip>ig && is>ip;
  const th=sc.tier_head||[];
  const gridAlpha = th.length>0 && th[0]==="Bronze" && th.every((v,i)=> i===0 || v>=th[i-1]);
  return [
    // Phase 1 · Syntax & Initialisation
    {t:"Imported the pandas library", ok:/import\s+pandas/.test(cl)},
    {t:"Loaded spotify_tracks.csv into a DataFrame", ok:/read_csv\s*\(\s*['"][^'"]*spotify_tracks\.csv/.test(cl)},
    {t:"Assigned it to a variable (e.g. df)", ok:/\b[\w]+\s*=\s*[\w.]*read_csv\s*\(/.test(code)},
    {t:"Code ran without a syntax error", ok:r.ran && !/SyntaxError|IndentationError/.test(err)},
    {t:"Data Engine rendered all 300 rows", ok:shape[0]===300},
    // Phase 2 · Cardinal Sorting Execution
    {t:"Used .sort_values() on the data", ok:/\.sort_values\s*\(/.test(cl)},
    {t:"Set ascending=False to bring the top to the front", ok:/ascending\s*=\s*false/.test(cl)},
    {t:"Top row holds the maximum Total Streams", ok:hasNear(nums,sc.truth_max_streams,0)},
    {t:"References the Total Streams (Cardinal) column", ok:/total streams/i.test(code)},
    {t:"Overwrote df with the new sorted order", ok:/df\s*=\s*[\w.\[\]"' ]*\.sort_values/i.test(code)||/inplace\s*=\s*true/.test(cl)},
    // Phase 3 · The Ordinal Trap
    {t:"Sorted the Popularity Tier (Ordinal) column", ok:/sort_values/.test(cl) && /popularity tier/i.test(code)},
    {t:"Printed the top 10 rows (.head(10))", ok:/\.head\s*\(\s*10\s*\)/.test(cl)},
    {t:"Output proves the alphabetical Bronze→Gold→Platinum→Silver order", ok:seqAlpha},
    {t:"Wrote a note that alphabetical sorting breaks the rank", ok:/alphabet/i.test(out)},
    {t:"Flagged the broken Popularity Tier column in the grid", ok:cols.some(c=>/popularity|tier/i.test(c)&&flaggedCols.has(c))},
    // Phase 4 · Data Engine Integrity
    {t:"Grid free of accidental row deletions (300)", ok:shape[0]===300},
    {t:"All 8 original columns intact", ok:colsIntact},
    {t:"Data Engine visually shuffled into alphabetical order", ok:gridAlpha},
    {t:'Printed "Cardinal" next to Total Streams', ok:/cardinal/i.test(out)},
    {t:'Printed "Ordinal" next to Popularity Tier', ok:/ordinal/i.test(out)},
  ];
}

// Week 1 · Lesson 2 · Craftsman ("The Rank Mapper") — map tiers to 1..4 then sort
function computeRankMapChecks(r){
  const code=r.code||"", cl=code.toLowerCase();
  const out=r.stdout||"", err=r.err||"", allOut=out+"\n"+err;
  const cols=r.cols||[], shape=r.shape||[0,0], sc=r.scales||{};
  const hasDict=/\{[^{}]*['"]\w+['"]\s*:\s*\d/.test(code);
  const rankCol=sc.rank_col, rankNum=/int|float/.test(sc.rank_dtype||"");
  const head=sc.rank_head||[], tail=sc.rank_tail||[];
  const descTop = head.length>0 && head[0]===4;
  const ascBottom = tail.length>0 && tail[tail.length-1]===1;
  const tempoCol=cols.find(c=>/tempo/i.test(c));
  return [
    // Phase 1 · Dictionary Logic Formulation
    {t:"Code Box contains a valid Python dictionary", ok:hasDict},
    {t:'Mapped "Bronze" to the integer 1', ok:/["']bronze["']\s*:\s*1\b/i.test(code)},
    {t:'Mapped "Silver" to the integer 2', ok:/["']silver["']\s*:\s*2\b/i.test(code)},
    {t:'Mapped "Gold" to the integer 3', ok:/["']gold["']\s*:\s*3\b/i.test(code)},
    {t:'Mapped "Platinum" to the integer 4', ok:/["']platinum["']\s*:\s*4\b/i.test(code)},
    // Phase 2 · Execution & Mapping
    {t:"Targeted the Popularity Tier column", ok:/popularity tier/i.test(code)},
    {t:"Called .map() or .replace() with the dictionary", ok:/\.(map|replace)\s*\(/.test(cl)},
    {t:"Transformation made no accidental NaN values", ok:!!rankCol && (sc.rank_nan===0)},
    {t:"Terminal confirms the column is now int64 / float64", ok:rankNum && /int64|float64/i.test(out)},
    {t:"Text converted to numbers in the live grid", ok:!!rankCol},
    // Phase 3 · The Semantic Sort Verification
    {t:"Re-ran .sort_values() on the mapped ranks", ok:/sort_values/.test(cl) && /rank/i.test(cl)},
    {t:"Used ascending=False to bring Platinum (4) to the top", ok:/ascending\s*=\s*false/.test(cl)},
    {t:"Printed the .head() of the result", ok:/\.head\s*\(/.test(cl)},
    {t:"Output proves the 4 (Platinum) rows sit above the 3s", ok:descTop},
    {t:"Printed the .tail() showing the 1 (Bronze) rows at the bottom", ok:/\.tail\s*\(/.test(cl) && ascBottom},
    // Phase 4 · Data Engine Integrity
    {t:"Still exactly 300 rows after mapping", ok:shape[0]===300},
    {t:"Other columns (Song Title, Tempo) unaffected", ok:cols.includes("Song Title") && !!tempoCol},
    {t:"Spreadsheet re-rendered into the 4·3·2·1 layout", ok:descTop},
    {t:"Renamed the column to Tier Rank (mastery)", ok:cols.some(c=>/tier\s*rank/i.test(c))},
    {t:"Output is free of red error logs", ok:!err.trim()},
  ];
}

// Week 1 · Lesson 2 · Master ("The Scale Visualizer") — graded from the scale studio
function computeScalesVizChecks(r){
  const m=mstate2||{}, err=(r&&r.err)||"";
  const codeClean=!/SyntaxError|IndentationError/.test(err);
  const codeTxt=((document.getElementById("code-box")||{}).value||"").toLowerCase();
  const prevDone=tierProgress(0)>=PASS && tierProgress(1)>=PASS;
  return [
    // Phase 1 · The Disorganized Bar Chart
    {t:'Selected "Bar Chart" in the Scale Sandbox', ok:m.barChosen},
    {t:"Put the unmapped Popularity Tier text on the X-axis", ok:m.tierOnX},
    {t:"Y-axis tracks the count of songs", ok:m.yCount},
    {t:"Rendered the out-of-order bars (B, G, P, S)", ok:m.disorganized},
    {t:"Left a code comment noting the chart is misleading", ok:/#.*(mislead|disorgan|alphabet|out of order|out-of-order)/.test(codeTxt)},
    // Phase 2 · The Ordinal Correction
    {t:"Switched the X-axis to the mapped Tier Rank", ok:m.rankOnX},
    {t:"Bars snap into an ascending 1·2·3·4 staircase", ok:m.staircase},
    {t:"X-axis ticks are labelled with the integers", ok:m.intTicks},
    {t:"Kept a Bar chart (not a histogram) for the ranks", ok:m.barChosen && m.rankOnX},
    {t:"Added a descriptive chart title in the code", ok:/title/.test(codeTxt)},
    // Phase 3 · The Cardinal Sandbox
    {t:'Selected "Scatter Plot" from the dropdown', ok:m.scatterChosen},
    {t:"X-axis set to Cardinal Song Duration", ok:m.durationX},
    {t:"Y-axis set to Cardinal Total Streams", ok:m.streamsY},
    {t:"Rendered a massive point cloud", ok:m.cloud},
    {t:"Noted the inverse correlation in a comment", ok:/inverse|correlat|shorter/.test(codeTxt)},
    // Phase 4 · UI Polish & Printout
    {t:"Used the colour picker on the bars", ok:m.colorChanged},
    {t:"Python code is free of syntax errors", ok:codeClean},
    {t:"Data Engine synced with the Sandbox", ok:true},
    {t:'Clicked "Generate Lab Report"', ok:m.certClicked},
    {t:"100% across data scales, rank mapping & chart logic", ok:prevDone && m.staircase && m.cloud},
  ];
}

const GRADERS={
  "0.1.0":{ title:"🔤 The Alphabetical Trap", fn:computeScaleSortChecks,
    phases:["Phase 1 · Syntax & Initialisation","Phase 2 · Cardinal Sorting Execution",
            "Phase 3 · The Ordinal Trap","Phase 4 · Data Engine Integrity"],
    failHint:"Reach 16 / 20 to unlock the next tier. Sort <b>Total Streams</b> with <code>ascending=False</code>, then sort <b>Popularity Tier</b> and watch it fall into broken alphabetical order. Flag the Tier column in the grid." },
  "0.1.1":{ title:"🔢 The Rank Mapper", fn:computeRankMapChecks,
    phases:["Phase 1 · Dictionary Logic Formulation","Phase 2 · Execution & Mapping",
            "Phase 3 · The Semantic Sort Verification","Phase 4 · Data Engine Integrity"],
    failHint:"Reach 16 / 20 to unlock the next tier. Build a dict {Bronze:1, Silver:2, Gold:3, Platinum:4}, <code>.map()</code> it onto a new <b>Tier Rank</b> column, then sort it." },
  "0.1.2":{ title:"📊 The Scale Visualizer", fn:computeScalesVizChecks, liveUI:true,
    phases:["Phase 1 · The Disorganized Bar Chart","Phase 2 · The Ordinal Correction",
            "Phase 3 · The Cardinal Sandbox","Phase 4 · UI Polish & Printout"],
    failHint:"Reach 16 / 20 in the Scale Sandbox: a Bar chart of the raw Popularity Tier (out of order), then switch X to <b>Tier Rank (mapped)</b> for the staircase, then a Scatter of Song Duration vs Total Streams." },
  "0.0.2":{ title:"🗺 The Cartographer", fn:computeVizChecks, liveUI:true,
    phases:["Phase 1 · The Intentional Error","Phase 2 · The Qualitative Correction",
            "Phase 3 · The Quantitative Correction","Phase 4 · UI Polish & Printout"],
    failHint:"Reach 16 / 20 by building charts in the Sandbox: provoke the histogram type-mismatch, fix it with a Bar chart of House (Count), then a Histogram of Sprint Time." },
  "0.0.0":{ title:"🔍 The Type Detective", fn:computeTypeChecks,
    phases:["Phase 1 · Syntax & Initialisation","Phase 2 · Type Extraction",
            "Phase 3 · The Trap Identification","Phase 4 · Output & Completion"],
    failHint:"Reach 16 / 20 to unlock the next tier. Tip: click the <b>100m Sprint Time</b> column header in the Data Engine to flag it red." },
  "0.0.1":{ title:"🧼 The Sanitiser", fn:computeCleanChecks,
    phases:["Phase 1 · Target Isolation & String Slicing","Phase 2 · Type Casting",
            "Phase 3 · Mathematical Verification","Phase 4 · Data Engine Integrity"],
    failHint:"Reach 16 / 20 to unlock the next tier. Strip the \"s\", cast to <b>float</b>, then print the mean, max and min." }
};

function evaluateChecks(){
  const box=document.getElementById("checks");
  const g=GRADERS[gradeKey()];
  if(!g){ box.style.display="none"; return; }
  box.style.display="block";
  if(!lastRun && !g.liveUI){
    box.innerHTML='<div class="checks-top"><span class="c-title">'+g.title+' — 20 automatic checks</span></div>'+
      '<p class="checks-empty">Press ▶ Run to grade your code. You need <b>16 / 20 (80%)</b> to unlock the next tier.</p>';
    return;
  }
  const res=g.fn(lastRun||{});
  const passed=res.filter(c=>c.ok).length;
  const pct=Math.round(passed/res.length*100);
  const ok=passed>=16;

  let h='<div class="checks-top"><span class="c-title">'+g.title+'</span>'+
        '<span class="c-score'+(ok?" passed":"")+'">'+passed+' / 20'+(ok?" · passed ✓":"")+'</span></div>';
  g.phases.forEach((label,p)=>{
    const a=p*5;
    h+='<div class="checks-phase">'+label+'</div><ul>';
    for(let i=a;i<a+5;i++){
      const c=res[i];
      h+='<li class="'+(c.ok?"pass":"fail")+'"><span class="mk">'+(c.ok?"✓":(i+1))+'</span>'+escapeHtml(c.t)+'</li>';
    }
    h+='</ul>';
  });
  h+='<p class="checks-hint">'+(ok ? "Great work — 80% reached. The next tier is now unlocked." : g.failHint)+'</p>';
  box.innerHTML=h;

  // drive the mastery bar from the score, then refresh tabs (tier unlock) + bar
  setProgress(pct);
  renderMastery();
  renderTabs();
  if(typeof maybeShowCertButton==="function") maybeShowCertButton();
}
const codeBox=document.getElementById("code-box");
const codeHL=document.getElementById("code-hl");
const runBtn=document.getElementById("run-btn");

// live syntax highlighting: render highlighted layer behind the textarea
function syncHL(){
  codeHL.innerHTML=highlightPython(codeBox.value)+"\n";
  codeHL.scrollTop=codeBox.scrollTop;
  codeHL.scrollLeft=codeBox.scrollLeft;
}
codeBox.addEventListener("input",syncHL);
let _saveT=null;
codeBox.addEventListener("input",()=>{ clearTimeout(_saveT); _saveT=setTimeout(persistCode,400); });
codeBox.addEventListener("scroll",()=>{ codeHL.scrollTop=codeBox.scrollTop; codeHL.scrollLeft=codeBox.scrollLeft; });
const runStatus=document.getElementById("run-status");
const terminalEl=document.getElementById("terminal");
const dataEngineEl=document.getElementById("data-engine");
const stageEl=document.querySelector(".stage");
let pyodide=null, pyReady=false;

function setStatus(s){ runStatus.textContent=s; }

// keep Tab inside the editor instead of leaving the field
codeBox.addEventListener("keydown",e=>{
  if(e.key==="Tab"){
    e.preventDefault();
    const s=codeBox.selectionStart, en=codeBox.selectionEnd;
    codeBox.value=codeBox.value.slice(0,s)+"    "+codeBox.value.slice(en);
    codeBox.selectionStart=codeBox.selectionEnd=s+4;
    syncHL();
  }
  if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){ e.preventDefault(); runCode(); }
});
document.getElementById("reset-code").onclick=()=>{ clearSavedCode(); codeBox.value=starterCode; syncHL(); persistCode(); codeBox.focus(); };
runBtn.onclick=runCode;

async function initPy(){
  try{
    setStatus("loading python…");
    pyodide=await loadPyodide();
    setStatus("loading pandas + matplotlib…");
    await pyodide.loadPackage(["pandas","matplotlib"]);
    // copy the real CSV datasets (embedded as base64) into Pyodide's filesystem
    setStatus("loading datasets…");
    for(const name of Object.keys(DATASET_B64)){
      try{
        const bin=atob(DATASET_B64[name]);
        const bytes=new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
        pyodide.FS.writeFile(name, bytes);
      }catch(err){ /* skip unreadable dataset */ }
    }
    pyReady=true;
    setStatus("ready · ▶ Run or Ctrl+Enter");
  }catch(err){
    setStatus("python failed to load (offline?)");
    terminalEl.innerHTML='<span class="err"># Could not load the Python runtime.\n# A network connection is needed the first time.\n'+escapeHtml(String(err))+'</span>';
  }
}

// Sets up capture, preloads df/pd/plt, and defines an inline-terminal input().
const PY_PREAMBLE=`
import sys, io, base64, json, builtins, js
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.close("all")

_out = io.StringIO()
_old = (sys.stdout, sys.stderr)
sys.stdout = _out
sys.stderr = _out

async def __ainput(prompt=""):
    if prompt != "":
        print(prompt, end="")
    val = await js.__termAsk(_out.getvalue())
    print(val)
    return val

def __input(prompt=""):            # fallback if used outside async context
    if prompt != "":
        print(prompt, end="")
    v = js.window.prompt(str(prompt) if prompt else "Input:")
    if v is None: v = ""
    print(v)
    return v
builtins.input = __input

try:
    df = pd.read_csv(__file)
except Exception:
    df = None
`;
// Restores stdout and serialises the results (table data + any chart).
const PY_POSTAMBLE=`
sys.stdout, sys.stderr = _old
__stdout = _out.getvalue()
__data = ""
try:
    if isinstance(df, pd.DataFrame):
        __data = df.head(1000).to_json(orient="split", default_handler=str)
except Exception:
    __data = ""
__img = ""
try:
    if plt.get_fignums():
        _b = io.BytesIO()
        plt.gcf().savefig(_b, format="png", dpi=120, bbox_inches="tight")
        __img = base64.b64encode(_b.getvalue()).decode()
except Exception:
    __img = ""

# facts used by the automatic checker
__dtypes = "{}"
__shape = "[0,0]"
__cols = "[]"
try:
    if isinstance(df, pd.DataFrame):
        __dtypes = json.dumps({str(k): str(v) for k, v in df.dtypes.items()})
        __shape = json.dumps([int(df.shape[0]), int(df.shape[1])])
        __cols = json.dumps([str(c) for c in df.columns])
except Exception:
    pass

# sprint-column facts + ground truth (for the Craftsman cleaning checks)
__sprint = "{}"
try:
    _t = pd.read_csv(__file)
    _sc = [c for c in _t.columns if "Sprint" in c]
    info = {}
    if _sc:
        _c = pd.to_numeric(_t[_sc[0]].astype(str).str.replace("s", "", regex=False), errors="coerce")
        info["truth_mean"] = round(float(_c.mean()), 4)
        info["truth_min"]  = round(float(_c.min()), 4)
        info["truth_max"]  = round(float(_c.max()), 4)
        info["truth_nan"]  = int(_c.isna().sum())
        if isinstance(df, pd.DataFrame) and _sc[0] in df.columns:
            _s = df[_sc[0]]
            info["dtype"] = str(_s.dtype)
            _sn = pd.to_numeric(_s, errors="coerce")
            info["nan"]  = int(_sn.isna().sum())
            info["mean"] = round(float(_sn.mean()), 4) if _sn.notna().any() else None
    __sprint = json.dumps(info)
except Exception:
    pass

# scales facts (Week 1 · Lesson 2 — Spotify ordinal vs cardinal)
__scales = "{}"
try:
    info = {}
    _o = pd.read_csv(__file)
    _tcol = [c for c in _o.columns if "Popularity" in c or c.strip() == "Tier"]
    _scol = [c for c in _o.columns if "Stream" in c]
    if _scol:
        info["truth_max_streams"] = int(_o[_scol[0]].max())
    if isinstance(df, pd.DataFrame):
        # detect a mapped rank column (numeric values inside 1..4)
        for c in df.columns:
            _n = pd.to_numeric(df[c], errors="coerce").dropna()
            _u = set(int(x) for x in _n.unique().tolist()) if len(_n) else set()
            if _u and _u.issubset({1, 2, 3, 4}) and len(_u) >= 3:
                info["rank_col"] = str(c)
                info["rank_dtype"] = str(df[c].dtype)
                info["rank_nan"] = int(pd.to_numeric(df[c], errors="coerce").isna().sum())
                info["rank_head"] = [int(x) for x in _n.head(8).tolist()]
                info["rank_tail"] = [int(x) for x in _n.tail(8).tolist()]
                break
        if _tcol and _tcol[0] in df.columns:
            info["tier_head"] = [str(x) for x in df[_tcol[0]].astype(str).head(10).tolist()]
            info["tier_dtype"] = str(df[_tcol[0]].dtype)
    __scales = json.dumps(info)
except Exception:
    pass
`;

// Inline terminal input: resolves when the user submits a line in the terminal.
window.__termAsk=function(bufferText){
  return new Promise(resolve=>{
    const safe = bufferText ? dim(escapeHtml(bufferText)) : "";
    terminalEl.innerHTML = safe +
      '<span class="term-prompt"><span class="p">&#10095;</span> <input class="term-stdin" id="term-stdin" autocomplete="off" spellcheck="false" aria-label="Terminal input"></span>';
    terminalEl.scrollTop=terminalEl.scrollHeight;
    const inp=document.getElementById("term-stdin");
    inp.focus();
    inp.addEventListener("keydown",function onk(e){
      if(e.key==="Enter"){
        e.preventDefault();
        inp.removeEventListener("keydown",onk);
        inp.disabled=true;
        resolve(inp.value);
      }
    });
  });
};

async function runCode(){
  if(!pyReady){ setStatus("still loading…"); return; }
  persistCode();   // save the student's work before running
  // input(...) -> await __ainput(...) so reads happen inline in the terminal
  const code=codeBox.value.replace(/(?<![\w.])input\s*\(/g,"await __ainput(");
  const file=currentDatasetName();
  runBtn.disabled=true; setStatus("running…");
  terminalEl.innerHTML='<span class="dim">running…</span>';
  pyodide.globals.set("__file", file);
  let err="";
  try{
    await pyodide.runPythonAsync(PY_PREAMBLE);          // 1 · set up
    try{ await pyodide.runPythonAsync(code); }          // 2 · user code (may await input)
    catch(e){ err=String(e.message||e); }
    await pyodide.runPythonAsync(PY_POSTAMBLE);         // 3 · collect results
    const stdout=pyodide.globals.get("__stdout")||"";
    renderTerminal(stdout, err);
    renderData(pyodide.globals.get("__data"));
    renderChart(pyodide.globals.get("__img"), pyodide.globals.get("__data"));
    // remember this run so the auto-grader (and column flagging) can use it
    let dtypes={}, shape=[0,0], cols=[];
    try{ dtypes=JSON.parse(pyodide.globals.get("__dtypes")||"{}"); }catch(_){}
    try{ shape=JSON.parse(pyodide.globals.get("__shape")||"[0,0]"); }catch(_){}
    try{ cols=JSON.parse(pyodide.globals.get("__cols")||"[]"); }catch(_){}
    let sprint={}; try{ sprint=JSON.parse(pyodide.globals.get("__sprint")||"{}"); }catch(_){}
    let scales={}; try{ scales=JSON.parse(pyodide.globals.get("__scales")||"{}"); }catch(_){}
    lastRun={ code:codeBox.value, stdout, err, dtypes, shape, cols, sprint, scales, ran:true };
    evaluateChecks();
    setStatus(err ? "finished with an error" : "✓ ran successfully");
  }catch(e){
    // make sure stdout is restored even if the preamble/postamble failed
    try{ await pyodide.runPythonAsync("sys.stdout, sys.stderr = _old"); }catch(_){}
    const eMsg=String(e.message||e);
    const friendly=humanizePyError(eMsg);
    terminalEl.innerHTML=(friendly?'<span class="hint-line">💡 '+escapeHtml(friendly)+'</span>':'')+'<span class="err">'+escapeHtml(eMsg)+'</span>';
    setStatus("error");
  }finally{ runBtn.disabled=false; }
}

// Turn a raw Python traceback into one plain-English sentence for students.
function humanizePyError(err){
  if(!err) return "";
  const last=(String(err).trim().split("\n").pop()||"").trim();
  const rules=[
    [/NameError: name '([^']+)'/i, m=>"“"+m[1]+"” hasn’t been defined yet — check for a typo or a missing assignment."],
    [/IndentationError/i, ()=>"The indentation is off — Python needs consistent spaces at the start of a line."],
    [/SyntaxError/i, ()=>"There’s a syntax error — look for a missing bracket, quote or colon."],
    [/KeyError:\s*'?([^'\)\n]+)'?/i, m=>"There’s no column called “"+String(m[1]).trim()+"” — check the spelling against the Data Engine headers."],
    [/AttributeError: .*has no attribute '([^']+)'/i, m=>"That value has no “"+m[1]+"” — check the method name, or that the variable is really a DataFrame."],
    [/ValueError: could not convert string to float: '?([^'\n]*)'?/i, m=>"Couldn’t turn “"+String(m[1]).trim()+"” into a number — there’s still some text in that column to clean."],
    [/ValueError/i, ()=>"A ValueError means a value was the right type but not an allowed value — often a failed number conversion."],
    [/TypeError/i, ()=>"A TypeError means a value isn’t the type the code expected (for example, text where a number is needed)."],
    [/ZeroDivisionError/i, ()=>"Something divided by zero — check the denominator before dividing."],
    [/ModuleNotFoundError|ImportError/i, ()=>"That module isn’t available here — only pandas, numpy and matplotlib are pre-loaded."]
  ];
  for(const [re,fn] of rules){ const m=String(err).match(re); if(m) return fn(m); }
  return last ? ("Python stopped with: "+last) : "";
}
function renderTerminal(out, err){
  let html="";
  if(out && out.trim()){ html+=dim(escapeHtml(out.replace(/\n+$/,""))); }
  if(err && err.trim()){
    const friendly=humanizePyError(err);
    if(html) html+="\n";
    if(friendly) html+='<span class="hint-line">💡 '+escapeHtml(friendly)+'</span>';
    html+='<span class="err">'+escapeHtml(err.replace(/\n+$/,""))+'</span>';
  }
  if(!html){ html=ok("# ran with no printed output"); }
  terminalEl.innerHTML=html;
}

function renderData(dataJson){
  if(!dataJson){ return; }
  let d; try{ d=JSON.parse(dataJson); }catch(e){ return; }
  const cols=d.columns||[], rows=d.data||[];
  let h='<div class="data-note">Loaded into <b>df</b> · '+rows.length+' row'+(rows.length===1?"":"s")+' × '+cols.length+' columns</div>';
  h+='<table class="sheet"><thead><tr><th class="cnr"></th>';
  cols.forEach(()=>h+='<th></th>');
  h+='</tr><tr><th class="rn"></th>';
  cols.forEach((c,i)=>{ const fl=flaggedCols.has(c)?" colflag":"";
    h+='<th class="flagpick'+fl+'" data-col="'+i+'" title="Click to flag this column">'+escapeHtml(String(c))+"</th>"; });
  h+="</tr></thead><tbody>";
  rows.forEach((row,r)=>{
    h+='<tr><td class="rn">'+(r+1)+"</td>";
    row.forEach((cell,i)=>{
      const fl=flaggedCols.has(cols[i])?" colflag":"";
      if(cell===null){ h+='<td class="blank'+fl+'"></td>'; return; }
      const numeric=typeof cell==="number";
      h+='<td class="'+(numeric?"num":"")+fl+'">'+escapeHtml(String(cell))+"</td>";
    });
    h+="</tr>";
  });
  dataEngineEl.innerHTML=h+"</tbody></table>";

  // click a column header to flag/unflag it red (used by the auto-checker)
  dataEngineEl.querySelectorAll("th.flagpick").forEach(th=>{
    th.onclick=()=>{
      const name=cols[+th.dataset.col];
      if(flaggedCols.has(name)) flaggedCols.delete(name); else flaggedCols.add(name);
      renderData(dataJson);     // re-render to apply highlight
      evaluateChecks();         // re-grade (flagging is check #15)
    };
  });

  // feed the sandbox chart with a real numeric column
  const ds=currentDataset();
  let colIdx=cols.indexOf(ds.numMain);
  if(colIdx<0){ colIdx=cols.findIndex((c,i)=>rows.length && typeof rows[0][i]==="number"); }
  if(colIdx>=0){
    liveVals=rows.map(r=>r[colIdx]).filter(v=>typeof v==="number");
    if(!liveVals.length) liveVals=null;
  } else { liveVals=null; }
}

function clearChartImg(){
  const old=stageEl.querySelector(".chart-img");
  if(old) old.remove();
  stageEl.classList.remove("img");
  const svg=stageEl.querySelector("svg"); if(svg) svg.style.display="";
}
function renderChart(img, dataJson){
  if(img){
    // the code drew a real matplotlib chart — show it
    clearChartImg();
    const svg=stageEl.querySelector("svg"); if(svg) svg.style.display="none";
    const el=document.createElement("img");
    el.className="chart-img"; el.alt="Chart drawn by your code";
    el.src="data:image/png;base64,"+img;
    stageEl.appendChild(el);
    stageEl.classList.add("img");
  } else {
    // no figure: show the SVG sandbox driven by the real loaded values
    clearChartImg();
    drawChart();
  }
}

/* ══════════════════════════════════════════════════════════════════
   LOGIN / IDENTITY
══════════════════════════════════════════════════════════════════ */
const loginOverlay=document.getElementById("login-overlay");
const loginPin=document.getElementById("login-pin");
const loginErr=document.getElementById("login-err");
const userChip=document.getElementById("user-chip");
const rosterOverlay=document.getElementById("roster-overlay");

function openLogin(){ loginErr.textContent=""; loginPin.value=""; loginOverlay.classList.add("show");
  document.body.classList.add("locked"); setTimeout(()=>loginPin.focus(),50); }
function closeLogin(){ loginOverlay.classList.remove("show"); document.body.classList.remove("locked"); }

function setUser(u){
  currentUser=u;
  localStorage.setItem("datalab-session", JSON.stringify(u));
  if(u.role!=="guest") localStorage.setItem("datalab-name", u.name);
  loadProgress();
  loadCode();
  closeLogin();
  updateUserChip();
  render();
}
async function tryLogin(){
  const pin=(loginPin.value||"").replace(/\D/g,"").trim();
  if(!pin){ loginErr.textContent="Enter your PIN, or attend as a guest."; return; }
  if(!(window.crypto&&crypto.subtle)){ loginErr.textContent="This browser can't verify PINs here. Open the file in Chrome/Edge/Firefox, or attend as a guest."; return; }
  let h; try{ h=await hashPin(pin); }catch(_){ loginErr.textContent="Could not verify the PIN. Try guest mode."; return; }
  if(h===ADMIN_HASH){ setUser({key:"admin",name:"Administrator",role:"admin"}); return; }
  const roster=getRoster();
  if(roster[h]){ setUser({key:h, name:roster[h], role:"student"}); return; }
  loginErr.textContent="That PIN wasn't recognised. Check it and try again, or attend as a guest.";
  loginPin.select();
}
function loginAsGuest(){ setUser({key:"guest",name:"Guest",role:"guest"}); }
function logout(){
  currentUser=null;
  localStorage.removeItem("datalab-session");
  updateUserChip();
  openLogin();
}
function updateUserChip(){
  const isAdmin=currentUser && currentUser.role==="admin";
  document.getElementById("user-name").textContent=currentUser?currentUser.name:"Guest";
  document.getElementById("user-role").textContent=currentUser?currentUser.role:"guest";
  document.getElementById("user-admin-badge").style.display=isAdmin?"":"none";
  document.getElementById("user-role").style.display=isAdmin?"none":"";
  document.getElementById("admin-btn").style.display=isAdmin?"":"none";
  userChip.classList.toggle("show", !!currentUser);
}
function openRoster(){
  const totalTiers=CURRICULUM.reduce((a,wk)=>a+wk.lessons.length*3,0);
  const roster=getRoster();
  const imported=!!localStorage.getItem("datalab-roster");
  let rows="";
  Object.keys(roster).forEach(h=>{
    let prog={}; try{ prog=JSON.parse(localStorage.getItem("datalab-progress::"+h)||"{}"); }catch(_){}
    const mastered=Object.values(prog).filter(v=>v>=PASS).length;
    rows+='<tr><td>'+escapeHtml(roster[h])+'</td><td class="pin">#'+h.slice(0,8)+
      '</td><td class="'+(mastered?"done":"")+'">'+mastered+' / '+totalTiers+'</td></tr>';
  });
  document.getElementById("roster-body").innerHTML=
    '<table class="roster-table"><thead><tr><th>Student</th><th>ID</th><th>Tiers mastered</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<p class="sub" style="text-align:left;margin:1rem 0 .3rem">'+Object.keys(roster).length+' students · '+
    (imported?'using imported roster':'using built-in roster')+
    '. PINs are stored only as hashes; the ID is the first 8 characters of that hash.</p>'+
    '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.6rem">'+
      '<button class="login-btn" type="button" id="roster-import-btn" style="width:auto;margin:0;padding:.6rem 1rem">Import / update from CSV</button>'+
      (imported?'<button class="login-guest" type="button" id="roster-reset-btn" style="width:auto;margin:0;padding:.6rem 1rem">Revert to built-in</button>':'')+
    '</div>'+
    '<input type="file" id="roster-file" accept=".csv,text/csv" style="display:none">'+
    '<p class="login-err" id="roster-msg" style="text-align:left"></p>'+
    '<p class="sub" style="text-align:left;font-size:.78rem;margin-top:.3rem">CSV format: a header row, then <code>Student Name,PIN</code> on each line.</p>';
  const fileInput=document.getElementById("roster-file");
  document.getElementById("roster-import-btn").onclick=()=>fileInput.click();
  fileInput.onchange=()=>{ if(fileInput.files[0]) importRosterCSV(fileInput.files[0]); };
  const rb=document.getElementById("roster-reset-btn");
  if(rb) rb.onclick=()=>{ localStorage.removeItem("datalab-roster"); openRoster(); };
  rosterOverlay.classList.add("show");
}

// Parse a Name,PIN CSV, hash the PINs in-browser, and save the roster.
function importRosterCSV(file){
  const msg=document.getElementById("roster-msg");
  msg.style.color="#C0392B";
  if(!(window.crypto&&crypto.subtle)){ msg.textContent="This browser can't hash PINs here (need Chrome/Edge/Firefox)."; return; }
  const reader=new FileReader();
  reader.onload=async()=>{
    const lines=String(reader.result).split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const entries=[];
    lines.forEach((line,i)=>{
      const cut=line.lastIndexOf(",");
      if(cut<0) return;
      const name=line.slice(0,cut).trim().replace(/^"|"$/g,"");
      const pin=line.slice(cut+1).replace(/\D/g,"").trim();
      if(i===0 && !/^\d{4,8}$/.test(pin)) return;   // skip header row
      if(name && /^\d{4,8}$/.test(pin)) entries.push({name,pin});
    });
    if(!entries.length){ msg.textContent="No valid rows found. Expected: Student Name,PIN"; return; }
    const roster={};
    for(const e of entries){ roster[await hashPin(e.pin)]=e.name; }
    saveRoster(roster);
    msg.style.color="";
    msg.textContent="Imported "+entries.length+" students. PINs were hashed; the file's plain PINs were not stored.";
    openRoster();
  };
  reader.onerror=()=>{ msg.textContent="Could not read that file."; };
  reader.readAsText(file);
}
document.getElementById("login-btn").onclick=tryLogin;
document.getElementById("login-guest").onclick=loginAsGuest;
document.getElementById("logout-btn").onclick=logout;
document.getElementById("admin-btn").onclick=openRoster;
document.getElementById("roster-close").onclick=()=>rosterOverlay.classList.remove("show");
rosterOverlay.addEventListener("click",e=>{ if(e.target===rosterOverlay) rosterOverlay.classList.remove("show"); });
loginPin.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); tryLogin(); } });

function initAuth(){
  updateUserChip();
  if(!currentUser) openLogin();
}

/* ══════════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════════ */
initAuth();
render();
initPy();
