// ============================================================
// RUNNER DATA — pre-populated from your Coros dashboard
// Edit in settings or directly here.
// ============================================================

const RUNNER_DEFAULTS = {
  goalTime: "1:28:00",
  goalPace: "4:10",
  raceDate: "2026-09-20",
  startDate: "2026-05-25",

  // Tier goals (A/B/C) — decided after tune-up 10k uge 14
  goals: {
    A: { time: "1:28:00", pace: "4:10", description: "Stretch goal — kun hvis alt klikker + tune-up 10k @ 40:00" },
    B: { time: "1:30:00", pace: "4:16", description: "Realistisk hovedmål baseret på din profil" },
    C: { time: "1:32:00", pace: "4:21", description: "Safe target hvis ITBS flammer op undervejs" }
  },

  // Thresholds from Coros (current)
  thresholdPace: "4:28",    // /km
  lthr: 174,                 // Lactate Threshold HR
  maxHr: 195,
  restingHr: 53,
  
  // Realistic threshold target at peak
  thresholdGoal: "4:20",     // Was 4:15 — more honest given injury history

  // PRs (from Coros)
  prs: {
    "1k":  "3:09",
    "3k":  "11:29",
    "5k":  "19:13",
    "10k": "40:30",
    "hm":  "1:28:48",
    "m":   "3:34:29"
  },

  // Coros race predictor (current, decreasing trend)
  corosPredict: {
    "5k":  "21:20",
    "10k": "44:14",
    "hm":  "1:38:49",
    "m":   "3:27:35"
  },

  // Injury profile (REVISED — bilateral ITBS confirmed)
  injuries: {
    active:   ["bilateral-itbs", "patellar-tendinopathy-mild", "shinsplints"],
    asymmetry: "right-worse",
    history:  ["injured-since-feb-2026"]
  },

  // Training preferences
  daysPerWeek: 3,
  crossDaysPerWeek: 2,        // Added — bike/swim for cardio without impact
  qualityDay: "tue",
  longDay: "sun",
  strengthDay: "wed",

  // Cadence target (ITBS-protective)
  cadenceTarget: 180,         // spm — higher cadence reduces ITBS strain

  // AI
  aiProvider: "gemini",
  aiModel: "gemini-2.5-flash",
  aiKey: ""
};

// ============================================================
// PHASES of the 17-week build
// ============================================================
const PHASES = [
  {
    id: 1,
    name: "RE-ENTRY",
    weeks: [1, 2],
    color: "blue",
    focus: "Post-marathon recovery → genaktivér løbeapparatet",
    description: "15 dage post-marathon. Lave volumen, kun easy pace, skadefri base. Ingen kvalitet endnu. Vi tester benene først."
  },
  {
    id: 2,
    name: "BASE",
    weeks: [3, 4, 5, 6],
    color: "green",
    focus: "Aerob kapacitet + strides + introducer tempo",
    description: "Genopbyg aerob fundering. Strides 2x/uge. Forsigtig introduktion af tempo i uge 5-6. Lange ture op til 14km."
  },
  {
    id: 3,
    name: "BUILD",
    weeks: [7, 8, 9, 10, 11, 12],
    color: "amber",
    focus: "Threshold + VO2max + lange ture med kvalitet",
    description: "Hovedfase. Alternerer threshold-pas og VO2-intervaller. Lange ture med pickup-segmenter. Uge 12 er nedtonet (cutback)."
  },
  {
    id: 4,
    name: "PEAK",
    weeks: [13, 14, 15],
    color: "accent",
    focus: "Race-pace specifik · tune-up race",
    description: "Skarpere race-pace arbejde. Tune-up i uge 14 (10k eller 15k). Lange ture med store HMP-blokke."
  },
  {
    id: 5,
    name: "TAPER",
    weeks: [16, 17],
    color: "purple",
    focus: "Lad benene blive friske · behold fart",
    description: "Volumen ned, intensitet bevares. Sidste hårde pas tirsdag i racewekken. Søndag 20. sep: kanonen."
  }
];

// ============================================================
// COMMON PACE TARGETS (recalculated from threshold pace in app.js)
// These are reference values for sub-1:28
// ============================================================
const PACE_TARGETS = {
  recovery:  { min: "6:00", max: "7:00", label: "Recovery / easy" },
  easy:      { min: "5:15", max: "5:45", label: "Easy / aerobic" },
  longBase:  { min: "5:00", max: "5:30", label: "Long run base" },
  marathon:  { min: "4:45", max: "5:00", label: "MP" },
  hmp:       { min: "4:08", max: "4:12", label: "Half marathon pace (sub 1:28)" },
  threshold: { min: "4:18", max: "4:28", label: "Threshold (LT)" },
  tenK:      { min: "3:55", max: "4:05", label: "10k pace" },
  fiveK:     { min: "3:48", max: "3:55", label: "5k pace / VO2" },
  threeK:    { min: "3:38", max: "3:48", label: "3k / VO2 sharp" }
};
