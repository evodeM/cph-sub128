// ============================================================
// PREHAB / EXERCISE LIBRARY
// Targeted for: IT band, knee, shin splints
// Each exercise has an SVG animation (CSS keyframes)
// ============================================================

const BODY_ZONES = [
  {
    id: "hip",
    name: "Hofte / Glutes",
    status: "watch",
    description: "Svage glutes = IT-bånd flammer op. Glute med er kongen for løbere.",
    exercises: ["clamshell", "monsterwalk", "sidelying-raise", "bridge", "hip-airplane"]
  },
  {
    id: "itband",
    name: "IT-bånd / TFL",
    status: "pain",
    description: "Dit aktive problem — bilateral ITBS (smerter ydersiden af knæet). IT-båndet er IKKE stramt på den måde du kan strække ud — det er strukturelt stift. Behandlingen er HOFTE-ER + ECCENTRIC quad-work + cadence over 178 spm. Foam rolling dæmper kun TFL-spænding.",
    exercises: ["banded-hip-er", "lateral-stepdown", "clamshell", "sidelying-raise", "monsterwalk", "foamroll-tfl"]
  },
  {
    id: "knee",
    name: "Knæ (lateralt + infrapatellært)",
    status: "pain",
    description: "Dine smerter sidder på siden + lige under knæet, værre på højre side. Det her er ITBS distal insertion + sandsynligvis patellar tendinose. R > L indikerer biomekanisk asymmetri i hofte-styrke. Behandlingen: eccentric quad + unilateral glute-arbejde med EKSTRA fokus på højre.",
    exercises: ["lateral-stepdown", "spanish-squat", "vmo-activate", "split-squat", "single-leg-bridge", "banded-hip-er"]
  },
  {
    id: "shin",
    name: "Skinneben / Tibialis",
    status: "pain",
    description: "Shin splints = ofte for hurtig volume-progression + svag tibialis anterior. Vi styrker den.",
    exercises: ["tibraise", "toetap", "calf-raise", "heel-walk", "soleus-raise"]
  },
  {
    id: "calf",
    name: "Læg",
    status: "watch",
    description: "Stærke lægge beskytter både achilles og skinneben. Single-leg calf raise er guld.",
    exercises: ["calf-raise", "soleus-raise", "single-calf"]
  },
  {
    id: "core",
    name: "Core",
    status: "ok",
    description: "Stabilt core = mindre energi-spild på lange ture. Anti-rotation > sit-ups.",
    exercises: ["plank", "side-plank", "deadbug", "pallof-press"]
  }
];

const EXERCISES = {
  "clamshell": {
    name: "Clamshell",
    target: "Glute med",
    reps: "3x15 hver side",
    description: "Lig på siden, knæ bøjede 90°, fødder samlet. Roter øvre knæ op uden at vippe bækkenet. Hold 1 sek på toppen. Brug elastik for mere modstand.",
    anim: "clamshell"
  },
  "sidelying-raise": {
    name: "Side-lying leg raise",
    target: "Glute med",
    reps: "3x12 hver side",
    description: "Lig på siden, øvre ben strakt. Løft langsomt 30-40 cm op, tæer pegende frem (eller let nedad — IKKE op). Hold 1 sek. Det BRÆNDER i glute, ikke ydersiden af låret.",
    anim: "sidelying"
  },
  "monsterwalk": {
    name: "Monster walk (elastik om knæ)",
    target: "Glute med + abduktion",
    reps: "3x10 skridt frem/tilbage",
    description: "Elastik over knæ, semi-squat position. Gå sidelæns med kontrol — bevar spændingen i elastikken hele tiden. Også frem/tilbage.",
    anim: "rotate"
  },
  "bridge": {
    name: "Glute bridge",
    target: "Glute max",
    reps: "3x12",
    description: "På ryggen, knæ bøjede. Pres hælene i jorden, løft hofter til skulder-knæ-linje. Knib glutes på toppen. Hold 2 sek.",
    anim: "bridge"
  },
  "single-leg-bridge": {
    name: "Single-leg bridge",
    target: "Glute + hamstring",
    reps: "3x10 hver side",
    description: "Som glute bridge, men kun ét ben i jorden. Det andet strakt opad. Holder hofterne lige — ingen vipning.",
    anim: "bridge"
  },
  "hip-airplane": {
    name: "Hip airplane",
    target: "Hofte-stabilitet + glute med",
    reps: "3x8 hver side",
    description: "Stå på ét ben, læn overkroppen frem mens andet ben strækkes bagud (T-position). Roter hoften åbent og lukket — som et fly-vinge. Brutalt for stabilitet.",
    anim: "rotate"
  },
  "couch-stretch": {
    name: "Couch stretch (quad/TFL)",
    target: "Quad + hofte-fleksor",
    reps: "2x60 sek hver side",
    description: "Bagben på sofa/væg, knæ i jorden, forfod op på sofa. Foden i jorden foran. Knib glute, læn overkroppen op. Mærker strækket i quad/hofte-front.",
    anim: "pulse"
  },
  "foamroll-tfl": {
    name: "Foam roll TFL (IKKE selve IT-båndet)",
    target: "TFL · drivkraften bag ITBS",
    reps: "60-90 sek hver side",
    description: "IT-båndet er strukturelt stift og kan IKKE strækkes (Willett et al. 2014). Men TFL — den lille muskel øverst foran på hoften — kan løsnes. Lig på siden med foam rolleren under TFL (lige under hoftekam, FORAN). Hvil 60-90 sek. Forvent ubehag — det her er kerne-vævet bag dine ITBS-symptomer.",
    anim: "rotate"
  },
  "banded-hip-er": {
    name: "Banded hip external rotation",
    target: "Dyb ydre hofterotator · ITBS-kerne",
    reps: "3x12 hver side · HØJRE FØRST",
    description: "Sid på stol med elastik om begge knæ. Hold knæene over fødderne. Pres knæene udad MOD elastikken, hold 2 sek på toppen. Eller stå: elastik om ankel, roter benet udad. KRITISK for bilateral ITBS — styrker dybe hofterotatorer (piriformis, obturatorius) som glute medius alene ikke kan kompensere for. Start altid med højre (svageste).",
    anim: "rotate"
  },
  "lateral-stepdown": {
    name: "Lateral step-down (eccentric)",
    target: "VMO + glute kontrol · ITBS rehab #1",
    reps: "3x10/side · 3 sek ned",
    description: "Stå på en lav forhøjning (15-20cm). Sænk det MODSATTE ben LANGSOMT (3 sek tælling) til siden, rør gulvet med hælen, kom op (1 sek). KNÆET MÅ IKKE falde indad — det er hvad dit højre knæ formentlig gør. Start uden vægt; tilføj små håndvægte når kontrol er sikker. Den bedst-dokumenterede øvelse for ITBS-rehab.",
    anim: "pulse"
  },
  "spanish-squat": {
    name: "Spanish squat",
    target: "Quad isometrisk · patellar tendon",
    reps: "3x30-45 sek",
    description: "Bind elastik om begge knæ, fastgør til noget stabilt foran dig. Læn bagud i elastikken med strakte arme. Ned i squat, knæ pegende fremad. Hold isometrisk. Bedste øvelse for patellar tendinopati (smerter LIGE under knæskallen) — bygger sener uden compressive load.",
    anim: "pulse"
  },
  "wallsit": {
    name: "Wall sit + dorsifleksion",
    target: "Quad + VMO",
    reps: "3x45 sek",
    description: "Ryg mod væg, ned i 90° squat, knæ over ankler. Træk tæerne op mod skinneben undervejs — aktiverer tibialis anterior samtidig.",
    anim: "pulse"
  },
  "split-squat": {
    name: "Split squat",
    target: "Quad + glute + balance",
    reps: "3x10 hver side",
    description: "Stå med et ben foran, et bagved. Sænk bagerste knæ mod gulv. Forreste knæ over ankel. Brug evt. holdedunke i hænderne for vægt.",
    anim: "pulse"
  },
  "step-down": {
    name: "Step-down",
    target: "VMO + glute kontrol",
    reps: "3x8 hver side",
    description: "Stå på en lav forhøjning (20cm). Sænk det andet ben langsomt til siden, rør gulvet med hælen, kom op igen. KNÆET MÅ IKKE falde indad.",
    anim: "pulse"
  },
  "vmo-activate": {
    name: "VMO terminal extension",
    target: "VMO (indre quad)",
    reps: "3x15 hver side",
    description: "Sid på stol, ben strakt. Rotér foden let udad. Pres knæet ned mod gulv mens du strækker benet helt ud. Hold 2 sek. VMO er beskytteren af knæskallen.",
    anim: "calf"
  },
  "tibraise": {
    name: "Tibialis anterior raise",
    target: "Tibialis anterior",
    reps: "3x20",
    description: "Sid på stol med vægt på tæerne (eller stå med ryg mod væg). Træk tæerne så langt op mod skinnebenet som muligt. Hold 2 sek. KRITISK for shin splints.",
    anim: "toetap"
  },
  "toetap": {
    name: "Tip-tap (foran/bag)",
    target: "Tibialis + ankel",
    reps: "3x20 fremover",
    description: "Stå på ét ben, det andet 'tap'er foran og bag. Hold balancen. Aktiverer tibialis dynamisk.",
    anim: "toetap"
  },
  "calf-raise": {
    name: "Calf raise (gastrocnemius)",
    target: "Læg — øvre del",
    reps: "3x15",
    description: "Stå på trappetrin med forfoden, hælene udenfor. Hæv så højt som muligt på tæer, sænk LANGSOMT under trinet. 2-3 sek ned.",
    anim: "calf"
  },
  "single-calf": {
    name: "Single-leg calf raise",
    target: "Læg — unilateralt",
    reps: "3x12 hver side",
    description: "Som calf raise, men kun ét ben. Det andet bøjet. Sænk LANGSOMT — eccentrik er kongen for sene-styrke. Brug evt. dunke i hænder.",
    anim: "calf"
  },
  "soleus-raise": {
    name: "Soleus raise (bøjet knæ)",
    target: "Læg — nedre del / soleus",
    reps: "3x15",
    description: "Sid på stol med vægt på lårene (eller bare egen vægt). Knæ bøjet 90°. Hæv hælene. Soleus er den DYBE læg — overset af løbere men kritisk for skinneben.",
    anim: "calf"
  },
  "heel-walk": {
    name: "Heel walk",
    target: "Tibialis anterior",
    reps: "3x30 sek",
    description: "Gå på hælene i 30 sek, tæerne så højt op som muligt. Brænder i forsiden af skinnebenet. Også god opvarmning.",
    anim: "toetap"
  },
  "plank": {
    name: "Plank",
    target: "Core (anti-extension)",
    reps: "3x45 sek",
    description: "Albuer/tæer, lige linje fra hæl til skulder. Knib glutes og mave. Ikke synkende hofte, ikke høj røv.",
    anim: "pulse"
  },
  "side-plank": {
    name: "Side plank",
    target: "Core (anti-lateral flex)",
    reps: "3x30 sek hver side",
    description: "Sideplanke. Krop lige fra hovedfod til skulder. Hofter holdes oppe — ikke sænket. Direkte transfer til løbeform.",
    anim: "pulse"
  },
  "deadbug": {
    name: "Deadbug",
    target: "Core stabilitet",
    reps: "3x8 hver side",
    description: "På ryggen. Arme strakt op, knæ bøjet 90°. Sænk modsat arm + ben mod gulv samtidig — uden at korsryggen løfter. Tilbage. Skift.",
    anim: "pulse"
  },
  "pallof-press": {
    name: "Pallof press",
    target: "Anti-rotation",
    reps: "3x10 hver side",
    description: "Stå sidelæns til elastik (eller kabel). Hold elastikken ved brystet. Pres langsomt ud foran dig og hold 2 sek. Modstå rotationen.",
    anim: "pulse"
  }
};

// SVG snippets for exercise animations — simple stick figures
const EXERCISE_SVG = {
  clamshell: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <line x1="20" y1="50" x2="50" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="15" cy="50" r="4" fill="currentColor"/>
      <line x1="50" y1="50" x2="60" y2="65" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="60" y1="65" x2="70" y2="60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <g class="anim-leg-1">
        <line x1="50" y1="50" x2="60" y2="35" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="60" y1="35" x2="70" y2="40" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </svg>`,
  sidelying: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <line x1="20" y1="50" x2="50" y2="50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="15" cy="50" r="4" fill="currentColor"/>
      <line x1="50" y1="50" x2="80" y2="55" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <g class="anim-sidelying">
        <line x1="50" y1="48" x2="78" y2="42" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </svg>`,
  bridge: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <g class="anim-bridge">
        <line x1="20" y1="60" x2="55" y2="60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="15" cy="60" r="4" fill="currentColor"/>
        <line x1="55" y1="60" x2="65" y2="75" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="65" y1="75" x2="75" y2="75" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <line x1="10" y1="85" x2="90" y2="85" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="2,2"/>
    </svg>`,
  calf: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <g class="anim-calf">
        <circle cx="50" cy="20" r="6" fill="currentColor"/>
        <line x1="50" y1="26" x2="50" y2="55" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="55" x2="45" y2="75" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="55" x2="55" y2="75" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="40" y1="78" x2="50" y2="78" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="78" x2="60" y2="78" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
      </g>
      <line x1="10" y1="85" x2="90" y2="85" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="2,2"/>
    </svg>`,
  toetap: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <circle cx="50" cy="20" r="6" fill="currentColor"/>
      <line x1="50" y1="26" x2="50" y2="55" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="55" x2="50" y2="78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <g class="anim-toetap">
        <line x1="50" y1="78" x2="62" y2="78" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
      </g>
      <line x1="10" y1="85" x2="90" y2="85" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="2,2"/>
    </svg>`,
  rotate: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <g class="anim-rotate">
        <circle cx="50" cy="50" r="20" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6,4"/>
        <circle cx="50" cy="30" r="4" fill="var(--accent)"/>
      </g>
    </svg>`,
  pulse: `
    <svg class="exercise-svg" viewBox="0 0 100 100">
      <g class="anim-pulse">
        <circle cx="50" cy="50" r="20" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="6" fill="var(--accent)"/>
      </g>
    </svg>`
};

// Daily 10-min pre-run routine (REVISED for bilateral ITBS)
const DAILY_ROUTINE = [
  { num: 1, name: "Glute bridge", detail: "2x10 · aktiverer bagside" },
  { num: 2, name: "Clamshell m. elastik", detail: "2x12/side · glute med" },
  { num: 3, name: "Banded hip ER", detail: "2x10/side · dyb rotator (R FØRST)" },
  { num: 4, name: "Monster walk", detail: "10 skridt frem/tilbage · hofte-stabilitet" },
  { num: 5, name: "Lateral step-down", detail: "1x8/side · ITBS-prehab (kort version)" },
  { num: 6, name: "Tibialis raise", detail: "2x15 · shin splint forsvar" },
  { num: 7, name: "Single-leg calf raise", detail: "2x10/side · lægge + akilles" },
  { num: 8, name: "Single-leg balance", detail: "30s/side · prop. + knæ-kontrol" }
];
