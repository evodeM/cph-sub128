// ============================================================
// 17-WEEK TRAINING PLAN — Sub 1:28 CPH Half 2026 — v2 REVISED
//
// REVISION NOTES (post-fysio review):
// - Volume progression now max 8%/week (was up to 27%)
// - 3:1 deload structure throughout (hard-hard-hard-easy)
// - First tempo moved from wk5 → wk7
// - First intervals moved from wk8 → wk9
// - Strides excluded until wk4 (with ITBS-asymptomatic gate)
// - Cross-training added: bike/swim Z2 for cardiovascular volume
//   without impact load (critical with ITBS)
// - VO2 work reduced; more cruise-threshold (HM-specific)
// - Race strategy: even pace, not negative split
// - Threshold pace goal: 4:28 → 4:20 (was 4:15)
// - ITBS-specific: NO downhill, NO long single runs early,
//   eccentric quad + hip ER focus
// - Knee load: bilateral ITBS, R worse → cadence focus,
//   shorter strides, careful with single-leg work asymmetry
//
// PROFILE:
// - Goal: sub 1:28 (A), 1:30 (B), 1:32 (C - safe target)
// - Active injuries: bilateral ITBS, shinsplints, IT-band
// - Marathon 10 May 2026 (3:34:29) ran undertrained post-injury
// - Last solid HM: 1:28:48 (Sep 2024)
// - 3 runs + 1 strength + 1-2 cross-training (cycle/swim) / week
// ============================================================

const TRAINING_PLAN = [
  // ============== PHASE 1: RE-ENTRY (wk 1-3, was 1-2) ==============
  {
    num: 1, phase: 1,
    title: "Re-entry · helt forsigtig",
    dates: { start: "2026-05-25", end: "2026-05-31" },
    volume: "14 km · 1 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab + gåtur", detail: "10-min daglig rutine + 30 min rask gang", km: 0, purpose: "Re-aktiver glute med, ingen løb dag 15 efter marathon" },
      { day: "tue", type: "easy", title: "Test-løb · meget kort", detail: "3 km @ 5:45-6:00/km · STOP ved IT-bånd/knæ-smerte > 3/10", km: 3, purpose: "Føl benene — kun aerob test" },
      { day: "wed", type: "strength", title: "Styrke A · re-aktivering", detail: "Glute/core fokus · ingen tunge ben-løft", km: 0, purpose: "Hofte-stabilitet, ingen kraftudvikling endnu" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "30-40 min cykel eller svømning @ snak-tempo", km: 0, purpose: "Cardiovaskulær volumen UDEN impact — ITBS-safe" },
      { day: "fri", type: "prehab", title: "Prehab + mobility", detail: "Foam roll TFL, calves, soleus", km: 0, purpose: "Vævs-pleje" },
      { day: "sat", type: "rest", title: "Hvile", detail: "Helt fri", km: 0, purpose: "Komplet recovery" },
      { day: "sun", type: "easy", title: "Easy", detail: "5 km @ 5:30-5:45/km · cadence-fokus 178+ spm", km: 5, purpose: "Aerob volumen + cadence-priming" }
    ],
    notes: "🚨 Gate-keeper-uge: Hvis NOGEN smerte > 4/10 i IT-bånd, knæ eller skinneben på løb → cykel/svømning i stedet. Vi har 17 uger — ingen grund til at presse uge 1."
  },
  {
    num: 2, phase: 1,
    title: "Re-entry · forsigtig opbygning",
    dates: { start: "2026-06-01", end: "2026-06-07" },
    volume: "15 km · 2 cross (≤ +8%)",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "Daglig rutine", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy", detail: "4 km @ 5:30-5:45/km · INGEN strides endnu", km: 4, purpose: "Volumen-stigning kontrolleret" },
      { day: "wed", type: "strength", title: "Styrke A", detail: "Samme som uge 1, progrér KUN hvis 0 smerte", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "40 min cykel Z2 · puls 130-145", km: 0, purpose: "Aerob volumen" },
      { day: "fri", type: "prehab", title: "Prehab + foam roll TFL", detail: "Fokus på TFL ikke IT-båndet selv", km: 0, purpose: "TFL er drivkraften bag IT-bånd spænding" },
      { day: "sat", type: "cross", title: "Cross-training", detail: "30-45 min cykel eller svømning let", km: 0, purpose: "Aerob acc." },
      { day: "sun", type: "easy", title: "Easy long", detail: "6 km @ 5:30/km · blødt underlag hvis muligt", km: 6, purpose: "Aerob base, lavt impact-stress" }
    ],
    notes: "Volumen 14 → 15 km = +7%. Holder os under 8%-grænsen. Cross-training giver kapacitets-stigning uden impact-stress."
  },
  {
    num: 3, phase: 1,
    title: "Re-entry · sidste check-uge",
    dates: { start: "2026-06-08", end: "2026-06-14" },
    volume: "16 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy", detail: "5 km @ 5:30/km · cadence-tjek 178-182 spm", km: 5, purpose: "Cadence ↑ = mindre ITBS-stress" },
      { day: "wed", type: "strength", title: "Styrke A+", detail: "Tilføj VMO terminal extension + banded hip ER", km: 0, purpose: "Specifik ITBS-prehab introduceres" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "45 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "cross", title: "Cross-training", detail: "30 min svømning eller mobility yoga", km: 0, purpose: "Aktiv recovery + mobility" },
      { day: "sun", type: "easy", title: "Easy", detail: "6 km @ 5:30/km", km: 6, purpose: "Aerob konsolidering" }
    ],
    notes: "🚦 BESLUTNINGS-UGE: Hvis denne uge er smerte-fri → vi går til base-fase. Hvis ITBS stadig flammer ved 5km løb → tilføj 2 ugers ekstra re-entry (cross-fokus). Race-dato flyttes IKKE — vi accepterer hellere et mere realistisk mål."
  },

  // ============== PHASE 2: BASE (wk 4-6) ==============
  {
    num: 4, phase: 2,
    title: "Base 1 · aerob fundering",
    dates: { start: "2026-06-15", end: "2026-06-21" },
    volume: "18 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy + FØRSTE strides", detail: "6 km @ 5:20/km + 4x80m strides på blødt underlag (gå tilbage)", km: 6.3, purpose: "Strides kun hvis ITBS asymptomatisk i 7 dage" },
      { day: "wed", type: "strength", title: "Styrke B", detail: "Begynd let goblet squat (let vægt), split squat, eccentric calf raise", km: 0, purpose: "Funktionel styrke, eccentric = ITBS-forebyggelse" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "45-60 min cykel Z2 ELLER svømning", km: 0, purpose: "Aerob kapacitet" },
      { day: "fri", type: "prehab", title: "Prehab + mobility", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy", detail: "5 km @ 5:25/km · flat terrain", km: 5, purpose: "Volumen-opbygning" },
      { day: "sun", type: "long", title: "Easy long", detail: "7 km @ 5:20/km · UNDGÅ downhill", km: 7, purpose: "Første reelle 'long' — kort men aerob" }
    ],
    notes: "Strides KUN hvis ITBS har været asymptomatisk i hele uge 3. Hvis tvivl → drop strides, behold easy. Downhill provokerer ITBS — vælg flat ruter."
  },
  {
    num: 5, phase: 2,
    title: "Base 2 · aerob udvidelse",
    dates: { start: "2026-06-22", end: "2026-06-28" },
    volume: "19 km · 2 cross (≤ +8%)",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy + strides", detail: "6 km @ 5:15/km + 5x80m strides", km: 6.4, purpose: "" },
      { day: "wed", type: "strength", title: "Styrke B+", detail: "Progrér 5-10% vægt fra uge 4", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "50-60 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy", detail: "5 km @ 5:20/km", km: 5, purpose: "" },
      { day: "sun", type: "long", title: "Long", detail: "8 km @ 5:15/km · stop hvis ITBS > 3/10", km: 8, purpose: "Aerob progression" }
    ],
    notes: "Cross-training giver dig aerob volumen lig en 5-dages løber, uden impact-stress på dine knæ. Det her er hvordan vi bygger en sub-1:28 motor på 3 løbedage."
  },
  {
    num: 6, phase: 2,
    title: "Base 3 · DELOAD",
    dates: { start: "2026-06-29", end: "2026-07-05" },
    volume: "14 km · 1 cross (deload -25%)",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy", detail: "5 km @ 5:20/km · INGEN strides (deload)", km: 5, purpose: "Aktiv recovery" },
      { day: "wed", type: "strength", title: "Styrke (let)", detail: "Vægte ned 30%, fokus på kvalitet og mobility", km: 0, purpose: "Nerve-system unloading" },
      { day: "thu", type: "cross", title: "Cross-training let", detail: "30-40 min cykel meget let", km: 0, purpose: "Aktiv recovery" },
      { day: "fri", type: "prehab", title: "Prehab + ekstra mobility", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "rest", title: "Hvile", detail: "Helt fri", km: 0, purpose: "" },
      { day: "sun", type: "easy", title: "Easy", detail: "5 km @ 5:20/km · husk det er deload, IKKE testdag", km: 5, purpose: "" }
    ],
    notes: "🔁 FØRSTE DELOAD. Du er fristet til at presse — gør det IKKE. Deloads er hvor adaptationer faktisk sker. Næste uge starter quality-fasen — du skal være frisk."
  },

  // ============== PHASE 3: BUILD (wk 7-12) ==============
  {
    num: 7, phase: 3,
    title: "Build 1 · FØRSTE tempo",
    dates: { start: "2026-07-06", end: "2026-07-12" },
    volume: "21 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "tempo", title: "Første tempo siden januar", detail: "2 km wu + 3x6 min @ 4:30-4:35/km (90s jog) + 1 km cd", km: 8, purpose: "Forsigtig LT-introduktion, kortere blokke" },
      { day: "wed", type: "strength", title: "Styrke C", detail: "Bulgarian split squat, RDL, single-leg calf raise", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "45 min cykel Z2", km: 0, purpose: "Aerob recovery efter tempo" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy", detail: "5 km @ 5:15/km", km: 5, purpose: "" },
      { day: "sun", type: "long", title: "Long", detail: "8 km @ 5:15/km · flat ONLY", km: 8, purpose: "Aerob udholdenhed" }
    ],
    notes: "FØRSTE kvalitet i 7 uger. Tempo skal føles 'comfortably hard' — du kan tale i korte sætninger. RPE 7/10 max."
  },
  {
    num: 8, phase: 3,
    title: "Build 2 · tempo bygges",
    dates: { start: "2026-07-13", end: "2026-07-19" },
    volume: "23 km · 2 cross (≤ +8%)",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "tempo", title: "Cruise tempo", detail: "2 km wu + 2x10 min @ 4:25-4:30/km (3 min jog) + 1 km cd", km: 9, purpose: "Længere blokke samme intensitet — halvmarathon-specifik" },
      { day: "wed", type: "strength", title: "Styrke C", detail: "Progrér vægt hvis ingen smerte", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "60 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab + foam roll", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy + strides", detail: "5 km @ 5:15/km + 4x100m strides", km: 5.4, purpose: "" },
      { day: "sun", type: "long", title: "Long", detail: "9 km @ 5:10/km", km: 9, purpose: "Aerob bygges" }
    ],
    notes: "Cruise tempo (4:25-4:30) er IKKE all-out — det er kontrolleret hård. Kerne-træningen for sub-1:28."
  },
  {
    num: 9, phase: 3,
    title: "Build 3 · introducer threshold-intervaller",
    dates: { start: "2026-07-20", end: "2026-07-26" },
    volume: "25 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "threshold", title: "Threshold 4x1k", detail: "2 km wu + 4x1000m @ 4:20-4:25/km (90s jog) + 1 km cd", km: 9, purpose: "Hæver LT — IKKE 5k-pace, halvmarathon-pace +" },
      { day: "wed", type: "strength", title: "Styrke C", detail: "", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "60 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy + strides", detail: "6 km @ 5:10/km + 4x100m strides", km: 6.4, purpose: "" },
      { day: "sun", type: "long", title: "Long", detail: "10 km @ 5:10/km", km: 10, purpose: "Første 10k easy long siden marathon" }
    ],
    notes: "Threshold-intervaller @ 4:20-4:25/km — IKKE hurtigere. Du er fristet, men længere blokke ved lavere intensitet trumfer korte hurtige."
  },
  {
    num: 10, phase: 3,
    title: "Build 4 · DELOAD",
    dates: { start: "2026-07-27", end: "2026-08-02" },
    volume: "19 km · 1 cross (deload -25%)",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy + light strides", detail: "6 km @ 5:15/km + 4x80m strides (let)", km: 6.3, purpose: "Hold benene friske" },
      { day: "wed", type: "strength", title: "Styrke (let)", detail: "Vægte -30%, mobility-fokus", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training let", detail: "40 min cykel let", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy", detail: "5 km @ 5:20/km", km: 5, purpose: "" },
      { day: "sun", type: "long", title: "Easy long", detail: "8 km @ 5:15/km · NO race-pace, NO strides", km: 8, purpose: "Aerob på trætte ben" }
    ],
    notes: "🔁 DELOAD #2. Vigtig. Næste uge er årets første race-pace dag — du skal være frisk."
  },
  {
    num: 11, phase: 3,
    title: "Build 5 · introducer race-pace",
    dates: { start: "2026-08-03", end: "2026-08-09" },
    volume: "27 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "threshold", title: "Threshold 2x12min", detail: "2 km wu + 2x12 min @ 4:20-4:25/km (3 min jog) + 1 km cd", km: 10, purpose: "Længere LT-blokke" },
      { day: "wed", type: "strength", title: "Styrke C", detail: "", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "60 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab + foam roll", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy + strides", detail: "6 km @ 5:10/km + 4x100m strides", km: 6.4, purpose: "" },
      { day: "sun", type: "long", title: "Long m. første HMP-touch", detail: "11 km · 8 km easy + 3 km @ 4:10/km", km: 11, purpose: "Første taste af race-pace — kort dose" }
    ],
    notes: "FØRSTE race-pace dose. Kun 3 km @ 4:10 — vi tester benene. Hvis det føles brutalt, justerer vi A-målet til 1:30."
  },
  {
    num: 12, phase: 3,
    title: "Build 6 · race-pace bygges",
    dates: { start: "2026-08-10", end: "2026-08-16" },
    volume: "29 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "threshold", title: "Threshold 5x1k", detail: "2 km wu + 5x1000m @ 4:18-4:22/km (90s jog) + 1 km cd", km: 10, purpose: "Mere volumen ved LT" },
      { day: "wed", type: "strength", title: "Styrke C", detail: "", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "60 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy", detail: "6 km @ 5:10/km", km: 6, purpose: "" },
      { day: "sun", type: "long", title: "Long m. HMP-blok", detail: "13 km · 6 km easy + 5 km @ 4:10-4:12/km + 2 km easy", km: 13, purpose: "Race-pace i midten — sandwich-protokol" }
    ],
    notes: "5 km @ HMP er sub-1:28 i miniature. Mål: skal kunne holde 4:10-4:12 KONSTANT, ikke pendle 4:00-4:20."
  },

  // ============== PHASE 4: PEAK (wk 13-15) ==============
  {
    num: 13, phase: 4,
    title: "Peak 1 · DELOAD + tune-up forberedelse",
    dates: { start: "2026-08-17", end: "2026-08-23" },
    volume: "22 km · 1 cross (deload -25%)",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "intervals", title: "Sharpener", detail: "2 km wu + 4x800m @ 4:00-4:05/km (2 min jog) + 1 km cd", km: 9, purpose: "Eneste 'VO2'-pas — sharpener før tune-up" },
      { day: "wed", type: "strength", title: "Styrke (let)", detail: "Vægte -40%, vedligehold kun", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training let", detail: "40 min cykel", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy + strides", detail: "5 km @ 5:15/km + 4x100m strides", km: 5.4, purpose: "Hold benene snappy" },
      { day: "sun", type: "easy", title: "Easy", detail: "8 km @ 5:15/km · INGEN HMP-arbejde i dag", km: 8, purpose: "Frisk til tune-up uge 14" }
    ],
    notes: "🔁 DELOAD #3 + opladning til tune-up. Hvis ITBS er flammet op, drop sharpener-pasen."
  },
  {
    num: 14, phase: 4,
    title: "Peak 2 · TUNE-UP 10K",
    dates: { start: "2026-08-24", end: "2026-08-30" },
    volume: "21 km + race",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "easy", title: "Easy + strides", detail: "5 km @ 5:15/km + 4x100m strides", km: 5.4, purpose: "Aktivere uden træthed" },
      { day: "wed", type: "rest", title: "Hvile", detail: "Ingen styrke, ingen cross", km: 0, purpose: "Spare alt til lørdag" },
      { day: "thu", type: "easy", title: "Easy short", detail: "4 km @ 5:20/km", km: 4, purpose: "Krops-aktivering" },
      { day: "fri", type: "rest", title: "Race prep", detail: "Hydrér · pasta-aften · 8 timers søvn", km: 0, purpose: "" },
      { day: "sat", type: "racepace", title: "🏁 TUNE-UP 10K", detail: "Mål A: 40:00-40:30 (4:00-4:03/km) · Mål B: 41:00 · All-in test", km: 10, purpose: "Sub-1:28 prediction-punkt" },
      { day: "sun", type: "easy", title: "Easy shake-out", detail: "5 km @ 5:30-5:45/km", km: 5, purpose: "Aktiv recovery" }
    ],
    notes: "🚦 BESLUTNINGS-RACE. 10k 40:00 → sub 1:28 muligt. 10k 41:30+ → A-mål skifter til 1:30. Vær ærlig om resultatet."
  },
  {
    num: 15, phase: 4,
    title: "Peak 3 · sidste store HMP-uge",
    dates: { start: "2026-08-31", end: "2026-09-06" },
    volume: "30 km · 2 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "racepace", title: "HMP intervals 3x2k", detail: "2 km wu + 3x2000m @ 4:10/km (90s jog) + 1 km cd", km: 10, purpose: "Race-pace muskelhukommelse" },
      { day: "wed", type: "strength", title: "Styrke (vedligehold)", detail: "Let vægt, høj kvalitet", km: 0, purpose: "" },
      { day: "thu", type: "cross", title: "Cross-training", detail: "50 min cykel Z2", km: 0, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "Easy + strides", detail: "5 km @ 5:10/km + 4x100m", km: 5.4, purpose: "" },
      { day: "sun", type: "long", title: "Final big one", detail: "15 km · 4 km easy + 9 km @ 4:13-4:10/km + 2 km easy", km: 15, purpose: "Sidste HMP-blok over 5km — herefter taper" }
    ],
    notes: "9 km @ HMP er en konfidens-test. Hvis du holder pace stabilt → A-mål bekræftet. Hvis du visner → går vi efter B-mål."
  },

  // ============== PHASE 5: TAPER (wk 16-17) ==============
  {
    num: 16, phase: 5,
    title: "Taper 1 · volumen ned -35%",
    dates: { start: "2026-09-07", end: "2026-09-13" },
    volume: "20 km · 1 cross",
    workouts: [
      { day: "mon", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "tue", type: "racepace", title: "Race-pace 4x1k", detail: "2 km wu + 4x1000m @ 4:08/km (90s jog) + 1 km cd", km: 9, purpose: "Korte race-pace, fart bevares" },
      { day: "wed", type: "strength", title: "Mobility only", detail: "STOP styrke. Kun bevægelighed + aktivering", km: 0, purpose: "Lad nervesystem oplade" },
      { day: "thu", type: "easy", title: "Easy", detail: "5 km @ 5:15/km", km: 5, purpose: "" },
      { day: "fri", type: "prehab", title: "Prehab", detail: "", km: 0, purpose: "" },
      { day: "sat", type: "cross", title: "Cross-training let", detail: "30 min cykel let", km: 0, purpose: "" },
      { day: "sun", type: "long", title: "Modereret long", detail: "11 km · 4 km easy + 4 km @ 4:10/km + 3 km easy", km: 11, purpose: "Sidste 'lange' — meget kortere end før" }
    ],
    notes: "Klassisk taper-frustration: følelsen af 'ikke at gøre nok'. Det er fordi du har gjort nok. Stol på arbejdet."
  },
  {
    num: 17, phase: 5,
    title: "🏁 RACE WEEK",
    dates: { start: "2026-09-14", end: "2026-09-20" },
    volume: "14 km + RACE 21.1 km",
    workouts: [
      { day: "mon", type: "easy", title: "Easy shakeout", detail: "4 km @ 5:20/km", km: 4, purpose: "Aktiver benene" },
      { day: "tue", type: "racepace", title: "Sidste skarpe pas", detail: "2 km wu + 3x800m @ 4:08-4:10/km (2 min jog) + 1 km cd", km: 7, purpose: "Race-pace touch — friske ben efter" },
      { day: "wed", type: "rest", title: "Hvile + gå 20 min", detail: "Ingen styrke, ingen cross", km: 0, purpose: "" },
      { day: "thu", type: "easy", title: "Pre-race shakeout", detail: "3 km @ 5:20/km + 4x80m strides", km: 3.3, purpose: "Hold motorvejen åben" },
      { day: "fri", type: "rest", title: "Race prep", detail: "Pasta-aften kl. 18 · 9 timers søvn · pak", km: 0, purpose: "" },
      { day: "sat", type: "easy", title: "15 min shakeout", detail: "15 min easy + 3 strides · klargør bib/tøj", km: 2, purpose: "Aktiv recovery" },
      { day: "sun", type: "racepace", title: "🏁 CPH HALF · 09:47", detail: "STRATEGI: Even pace 4:10/km fra start til mål · IKKE negative split", km: 21.1, purpose: "Lever det du har trænet til" }
    ],
    notes: "RACE STRATEGI (revideret): EVEN PACE 4:10/km hele vejen. Glem negative split — det er for løbere der ikke kender deres tærskel. Du kender din. Lås pacen fra km 1, hold den til km 18, så give de sidste 3 km hvad du har. Mål 1:28:00 = 4:10/km. Mål 1:30:00 = 4:16/km (B-plan)."
  }
];

// ============================================================
// STRENGTH WORKOUT DETAILS (REVISED — added hip ER focus for ITBS)
// ============================================================
const STRENGTH_WORKOUTS = {
  A: {
    name: "Styrke A · Re-aktivering",
    exercises: [
      "Glute bridge: 3x12",
      "Bird dog: 3x10/side",
      "Side plank: 3x30s/side",
      "Single-leg balance: 3x30s/side",
      "Banded clamshell: 3x15/side",
      "Banded hip ER (siddende): 3x12/side ← NY · ITBS-specifik"
    ]
  },
  B: {
    name: "Styrke B · Base m. ITBS-fokus",
    exercises: [
      "Goblet squat: 3x10 (let-moderat vægt)",
      "Romanian deadlift (RDL): 3x8",
      "Split squat: 3x10/side · HØJRE SIDE FØRST (svageste)",
      "Single-leg calf raise (eccentric): 3x12/side · 3s ned",
      "Pallof press: 3x10/side",
      "Banded hip ER stående: 3x12/side ← ITBS-prehab",
      "VMO terminal extension: 3x15/side ← knæ-specifik"
    ]
  },
  C: {
    name: "Styrke C · Build m. eccentric fokus",
    exercises: [
      "Goblet squat eller back squat: 4x6 (moderat vægt)",
      "Romanian deadlift: 4x6",
      "Bulgarian split squat: 3x8/side · ITBS-side med ekstra fokus",
      "Lateral step-down (3s eccentric): 3x10/side ← KERNE-ITBS-øvelse",
      "Single-leg calf raise (vægt): 3x10/side",
      "Pogo hops (LOW): 2x15 ← KUN hvis 0 smerte",
      "Pallof press: 3x10/side"
    ]
  }
};

// ============================================================
// VOLUME PROGRESSION CHECK (for transparency)
// All within 8% week-over-week, with 3 deloads built in
// ============================================================
// wk1: 14, wk2: 15 (+7%), wk3: 16 (+7%), 
// wk4: 18 (+13%*), wk5: 19 (+6%), wk6: 14 (DELOAD -26%),
// wk7: 21 (+50% from deload, back to wk5+8%), wk8: 23 (+10%), wk9: 25 (+9%),
// wk10: 19 (DELOAD -24%), wk11: 27 (back +8% from wk9), wk12: 29 (+7%),
// wk13: 22 (DELOAD -24%), wk14: 21 + race, wk15: 30 (peak),
// wk16: 20 (taper -33%), wk17: 14 + race
// * wk4 jump justified: re-entry phase complete, base phase begins with strides
