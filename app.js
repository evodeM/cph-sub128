// ============================================================
// APP LOGIC
// State management · rendering · AI integration · Supabase sync
// ============================================================

// ============================================================
// SUPABASE — erstat med dine egne værdier
// Find dem i: Supabase Dashboard → Settings → API
// ============================================================
// Credentials defineres i config.js (gitignored) — se config.example.js

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;   // sættes af onAuthStateChange

const STORAGE_KEYS = {
  logs: "sub128.logs",
  profile: "sub128.profile",
  ai: "sub128.ai",
  completedWorkouts: "sub128.completed",
  planOverrides: "sub128.planOverrides"
};

// ============================================================
// STATE
// ============================================================
const state = {
  profile: loadProfile(),
  logs: loadLogs(),
  ai: loadAi(),
  completed: loadCompleted(),
  planOverrides: loadPlanOverrides(),
  activeBodyZone: null,
  activePhaseTab: null
};

function loadProfile() {
  const stored = localStorage.getItem(STORAGE_KEYS.profile);
  return stored ? { ...RUNNER_DEFAULTS, ...JSON.parse(stored) } : { ...RUNNER_DEFAULTS };
}
function saveProfile() { localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.profile)); }

function loadLogs() {
  const stored = localStorage.getItem(STORAGE_KEYS.logs);
  return stored ? JSON.parse(stored) : [];
}
function saveLogs() { localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(state.logs)); }

function loadAi() {
  const stored = localStorage.getItem(STORAGE_KEYS.ai);
  return stored ? JSON.parse(stored) : { provider: "gemini", model: "gemini-2.5-flash", key: "" };
}
function saveAi() { localStorage.setItem(STORAGE_KEYS.ai, JSON.stringify(state.ai)); }

function loadPlanOverrides() {
  const stored = localStorage.getItem(STORAGE_KEYS.planOverrides);
  return stored ? JSON.parse(stored) : {};
}
function savePlanOverrides() {
  localStorage.setItem(STORAGE_KEYS.planOverrides, JSON.stringify(state.planOverrides));
}

// Returns a workout merged with any AI-approved overrides
// Override key: "wk{weekNum}-{day}"  e.g. "wk3-tue"
function getEffectiveWorkout(weekNum, wo) {
  const key = `wk${weekNum}-${wo.day}`;
  const ov = state.planOverrides[key];
  if (!ov) return wo;
  return { ...wo, ...ov, _modified: true };
}

function loadCompleted() {
  const stored = localStorage.getItem(STORAGE_KEYS.completedWorkouts);
  return stored ? JSON.parse(stored) : {};
}
function saveCompleted() { localStorage.setItem(STORAGE_KEYS.completedWorkouts, JSON.stringify(state.completed)); }

// ============================================================
// HELPERS — time/pace math
// ============================================================
function paceToSec(pace) {
  // "4:28" -> 268
  const [m, s] = pace.split(":").map(Number);
  return m * 60 + s;
}
function secToPace(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function timeToSec(time) {
  // "1:28:48" or "40:30"
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}
function secToTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function daysBetween(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// COUNTDOWN
// ============================================================
function updateCountdown() {
  const days = daysBetween(todayISO(), state.profile.raceDate);
  const big = document.getElementById("countdown-big");
  const mini = document.getElementById("countdown-mini");
  if (big) big.textContent = days >= 0 ? days : "—";
  if (mini) mini.textContent = days >= 0 ? `${days} dage til race` : "RACE DAY";
}

// ============================================================
// CURRENT WEEK
// ============================================================
function getCurrentWeekNum() {
  const today = new Date();
  const start = new Date(state.profile.startDate);
  const days = daysBetween(state.profile.startDate, todayISO());
  if (days < 0) return 1;
  const week = Math.floor(days / 7) + 1;
  return Math.min(week, 17);
}

function getCurrentPhase() {
  const week = getCurrentWeekNum();
  return PHASES.find(p => p.weeks.includes(week));
}

// ============================================================
// DASHBOARD RENDERING
// ============================================================
// ============================================================
// I DAG — fremhævet kort øverst på dashboard
// ============================================================
function renderTodayCard() {
  const el = document.getElementById("today-card");
  if (!el) return;

  const weekNum = getCurrentWeekNum();
  const week = TRAINING_PLAN[weekNum - 1];
  if (!week) { el.innerHTML = ""; return; }

  const dayMap = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat", 0: "sun" };
  const todayCode = dayMap[new Date().getDay()];
  const rawWo = week.workouts.find(w => w.day === todayCode);
  const wo = rawWo ? getEffectiveWorkout(weekNum, rawWo) : null;
  const key = wo ? `wk${weekNum}-${todayCode}` : null;
  const isDone = key ? !!state.completed[key] : false;
  const isRunType = wo && ["easy", "tempo", "threshold", "intervals", "long", "racepace"].includes(wo.type);

  const dateStr = new Date().toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });

  if (!wo || wo.type === "rest") {
    el.innerHTML = `
      <div class="today-rest">
        <div class="today-date">${dateStr}</div>
        <div class="today-rest-label">Hvildag</div>
        <div class="today-rest-sub">Kroppen vokser mens du hviler — nyd det.</div>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="today-inner ${isDone ? "done" : ""}">
      <div class="today-meta">
        <span class="today-date">${dateStr}</span>
        <span class="today-week-tag">Uge ${weekNum} · ${tagFor(wo.type)}</span>
      </div>
      <div class="today-title">${wo.title}</div>
      ${wo.detail ? `<div class="today-detail">${wo.detail}</div>` : ""}
      ${wo.purpose ? `<div class="today-purpose">→ ${wo.purpose}</div>` : ""}
      <div class="today-actions">
        <button class="today-done-btn ${isDone ? "done" : ""}" data-key="${key}">
          ${isDone ? "✓ Gennemført" : "Markér færdig"}
        </button>
        ${isRunType ? `<button class="today-log-btn">Log pas →</button>` : ""}
      </div>
    </div>`;

  el.querySelector(".today-done-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.completed[key]) {
      delete state.completed[key];
      sbDeleteCompleted(key);
    } else {
      state.completed[key] = true;
      sbInsertCompleted(key);
    }
    saveCompleted();
    renderTodayCard();
    renderWeeks(document.querySelector(".phase-tab.active")?.dataset.phase || "all");
  });

  el.querySelector(".today-log-btn")?.addEventListener("click", () => {
    const dateEl = document.getElementById("log-date");
    const typeEl = document.getElementById("log-type");
    const kmEl   = document.getElementById("log-km");
    if (dateEl) dateEl.value = todayISO();
    if (typeEl) typeEl.value = wo.type;
    if (kmEl && wo.km) kmEl.value = wo.km;
    document.querySelector('.tab[data-tab="logger"]')?.click();
    setTimeout(() => document.getElementById("log-km")?.focus(), 200);
  });
}

function renderDashboard() {
  updateCountdown();
  renderTodayCard();
  renderThisWeek();
  renderPhaseList();
  renderSplits();
  document.getElementById("stat-thr-pace").textContent = state.profile.thresholdPace;
  document.getElementById("stat-lthr").textContent = state.profile.lthr;
  document.getElementById("stat-mhr").textContent = state.profile.maxHr;
  document.getElementById("predict-time").textContent = state.profile.corosPredict.hm;
  const goalSecA = timeToSec(state.profile.goalTime);
  const goalSecB = timeToSec("1:30:00");
  const currentSec = timeToSec(state.profile.corosPredict.hm);
  const deltaA = currentSec - goalSecA;
  const deltaB = currentSec - goalSecB;
  document.getElementById("gap-delta").textContent = `−${secToTime(deltaA)} til A · −${secToTime(deltaB)} til B`;
}

function renderThisWeek() {
  const weekNum = getCurrentWeekNum();
  const week = TRAINING_PLAN[weekNum - 1];
  if (!week) return;
  document.getElementById("week-meta").textContent = `Uge ${weekNum} / 17 · ${week.title}`;

  const today = new Date().getDay(); // 0=sun, 1=mon...
  const dayMap = { 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat", 0: "sun" };
  const todayCode = dayMap[today];
  const dayLabels = { mon: "MAN", tue: "TIR", wed: "ONS", thu: "TOR", fri: "FRE", sat: "LØR", sun: "SØN" };

  const html = week.workouts.map(w => {
    const isToday = w.day === todayCode;
    return `
      <div class="this-week-workout ${isToday ? "today" : ""}">
        <div class="workout-day ${isToday ? "today" : ""}">${dayLabels[w.day]}</div>
        <div class="workout-desc">
          <div class="workout-desc-title">${w.title} ${tagFor(w.type)}</div>
          <div class="workout-desc-detail">${w.detail || ""}</div>
        </div>
        <div class="workout-distance">${w.km ? w.km + " km" : ""}</div>
      </div>
    `;
  }).join("");
  document.getElementById("this-week-content").innerHTML = html;
}

function tagFor(type) {
  const labels = {
    easy: "Easy", tempo: "Tempo", threshold: "Threshold",
    intervals: "VO2", long: "Long", racepace: "Race-pace",
    strength: "Styrke", prehab: "Prehab", rest: "Hvile",
    cross: "Cross", strides: "Strides"
  };
  return `<span class="tag ${type}">${labels[type] || type}</span>`;
}

function renderPhaseList() {
  const currentWeek = getCurrentWeekNum();
  const html = PHASES.map(p => {
    const isCurrent = p.weeks.includes(currentWeek);
    const weeksLabel = `Uge ${p.weeks[0]}–${p.weeks[p.weeks.length - 1]}`;
    return `
      <div class="phase-row ${isCurrent ? "current" : ""}">
        <span class="phase-num">FASE ${p.id}</span>
        <div>
          <div class="phase-name">${p.name}</div>
          <div class="phase-weeks">${p.focus}</div>
        </div>
        <span class="phase-weeks">${weeksLabel}</span>
      </div>
    `;
  }).join("");
  document.getElementById("phase-list").innerHTML = html;
}

function renderSplits() {
  // REVISED: Even pace strategy for sub 1:28
  // Lock 4:10 from start, hold to km 18, finish with what's left
  const splits = [
    { km: "0–3 km", pace: "4:10", label: "lock", class: "cruise" },
    { km: "3–5 km", pace: "4:10", label: "settle", class: "cruise" },
    { km: "5–10 km", pace: "4:10", label: "cruise", class: "cruise" },
    { km: "10–15 km", pace: "4:10", label: "cruise", class: "cruise" },
    { km: "15–18 km", pace: "4:10", label: "hold", class: "cruise" },
    { km: "18–20 km", pace: "4:08", label: "push", class: "kick" },
    { km: "20–21.1", pace: "4:05", label: "send", class: "kick" }
  ];
  const html = splits.map(s => `
    <div class="split-cell ${s.class}">
      <div class="split-km">${s.km}</div>
      <div class="split-pace">${s.pace}</div>
    </div>
  `).join("");
  document.getElementById("splits-grid").innerHTML = html;
}

// ============================================================
// PLAN RENDERING
// ============================================================
function renderPlan() {
  // Phase tabs
  const phaseHtml = PHASES.map(p => `
    <button class="phase-tab" data-phase="${p.id}">
      FASE ${p.id} · ${p.name}
    </button>
  `).join("");
  document.getElementById("phase-tabs").innerHTML = `
    <button class="phase-tab active" data-phase="all">ALLE 17</button>
    ${phaseHtml}
  `;

  document.querySelectorAll(".phase-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".phase-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderWeeks(btn.dataset.phase);
    });
  });

  renderWeeks("all");
}

// Returns expandable exercise HTML for strength/prehab workout rows
function getWorkoutExtrasHtml(wo, week) {
  if (wo.type === "strength") {
    const t = wo.title;
    const key = /Styrke A/i.test(t) ? "A"
              : /Styrke B/i.test(t) ? "B"
              : /Styrke C/i.test(t) ? "C"
              : (week.phase <= 2 ? "B" : "C"); // deload weeks inherit phase's level
    const sw = typeof STRENGTH_WORKOUTS !== "undefined" ? STRENGTH_WORKOUTS[key] : null;
    if (!sw) return "";
    const isDeload = /let|vedligehold|mobility/i.test(t);
    const deloadNote = isDeload
      ? `<p class="ex-deload-note">⬇ Deload-uge — -30% vægt, fokus på form og mobility</p>` : "";
    const exList = sw.exercises.map(e => `<li>${e}</li>`).join("");
    return `
      <div class="ex-expand">
        <button class="ex-toggle" type="button">Vis øvelser ▾</button>
        <div class="ex-list hidden">
          ${deloadNote}
          <p class="ex-program-name">${sw.name}</p>
          <ul class="ex-ul">${exList}</ul>
        </div>
      </div>`;
  }
  if (wo.type === "prehab") {
    const items = (typeof DAILY_ROUTINE !== "undefined" ? DAILY_ROUTINE : [])
      .map(r => `<li><strong>${r.name}</strong> — ${r.detail}</li>`).join("");
    return `
      <div class="ex-expand">
        <button class="ex-toggle" type="button">10-min rutine ▾</button>
        <div class="ex-list hidden">
          <ul class="ex-ul">${items}</ul>
        </div>
      </div>`;
  }
  return "";
}

function renderWeeks(phaseFilter) {
  const currentWeek = getCurrentWeekNum();
  const weeks = phaseFilter === "all" ? TRAINING_PLAN : TRAINING_PLAN.filter(w => String(w.phase) === phaseFilter);
  const dayLabels = { mon: "MAN", tue: "TIR", wed: "ONS", thu: "TOR", fri: "FRE", sat: "LØR", sun: "SØN" };

  const html = weeks.map(w => {
    const isOpen = w.num === currentWeek;
    const dateRange = `${formatDate(w.dates.start)} → ${formatDate(w.dates.end)}`;
    const workoutsHtml = w.workouts.map(rawWo => {
      const wo = getEffectiveWorkout(w.num, rawWo);
      const key = `wk${w.num}-${wo.day}`;
      const isDone = !!state.completed[key];
      const canComplete = wo.type !== "rest";
      return `
      <div class="workout-row ${isDone ? "workout-done" : ""}">
        <div class="workout-row-day">${dayLabels[wo.day]}</div>
        <div class="workout-row-content">
          <div class="workout-row-title">${tagFor(wo.type)} ${wo.title}${wo._modified ? ' <span class="ai-modified-badge" title="Ændret af AI-coach">AI ✎</span>' : ""}</div>
          ${wo.detail ? `<div class="workout-row-detail">${wo.detail}</div>` : ""}
          ${wo.purpose ? `<div class="workout-row-purpose">→ ${wo.purpose}</div>` : ""}
          ${getWorkoutExtrasHtml(wo, w)}
        </div>
        ${canComplete ? `<button class="complete-btn ${isDone ? "done" : ""}" data-key="${key}" title="${isDone ? "Markér som ikke gennemført" : "Markér som gennemført"}">${isDone ? "✓" : "○"}</button>` : ""}
      </div>`;
    }).join("");

    return `
      <div class="week-card ${isOpen ? "open" : ""}" data-week="${w.num}">
        <div class="week-header">
          <div class="week-num">${String(w.num).padStart(2, "0")}</div>
          <div>
            <div class="week-title">${w.title}</div>
            <div class="week-dates">${dateRange}</div>
          </div>
          <div class="week-volume">${w.volume}</div>
          <div class="week-toggle">▼</div>
        </div>
        <div class="week-body">
          ${workoutsHtml}
          ${w.notes ? `<div class="week-notes">💡 ${w.notes}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("plan-weeks").innerHTML = html;

  document.querySelectorAll(".week-header").forEach(h => {
    h.addEventListener("click", () => { h.parentElement.classList.toggle("open"); });
  });

  // Markér pas som gennemført / ikke gennemført
  document.querySelectorAll(".complete-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const key = btn.dataset.key;
      if (state.completed[key]) {
        delete state.completed[key];
        sbDeleteCompleted(key); // async
      } else {
        state.completed[key] = true;
        sbInsertCompleted(key); // async
      }
      saveCompleted();
      renderWeeks(document.querySelector(".phase-tab.active")?.dataset.phase || "all");
    });
  });

  // Toggle exercise lists
  document.querySelectorAll(".ex-toggle").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const list = btn.nextElementSibling;
      const isHidden = list.classList.contains("hidden");
      list.classList.toggle("hidden", !isHidden);
      btn.textContent = isHidden
        ? btn.textContent.replace("▾", "▴")
        : btn.textContent.replace("▴", "▾");
    });
  });
}

function formatDate(iso) {
  const d = new Date(iso);
  const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${d.getDate()}. ${months[d.getMonth()]}`;
}

// ============================================================
// ZONES
// ============================================================
function renderZones() {
  const thrPaceSec = paceToSec(state.profile.thresholdPace);
  const lthr = state.profile.lthr;
  const mhr = state.profile.maxHr;
  const rhr = state.profile.restingHr;

  // Pace zones (Daniels-inspired, anchored to T pace)
  const paceZones = [
    { name: "Recovery / E2", desc: "Aktiv recovery", min: thrPaceSec + 95, max: thrPaceSec + 140, cls: "recovery" },
    { name: "Easy / E1", desc: "Aerob base", min: thrPaceSec + 50, max: thrPaceSec + 95, cls: "aerobic" },
    { name: "Marathon / M", desc: "MP-tempo", min: thrPaceSec + 20, max: thrPaceSec + 35, cls: "power" },
    { name: "Threshold / T", desc: "LT-tempo (1 time effort)", min: thrPaceSec - 10, max: thrPaceSec + 5, cls: "threshold" },
    { name: "Interval / I", desc: "5k–10k pace · VO2", min: thrPaceSec - 35, max: thrPaceSec - 18, cls: "anaerobic" },
    { name: "Repetition / R", desc: "Mile/3k pace · speed", min: thrPaceSec - 55, max: thrPaceSec - 38, cls: "sprint" }
  ];

  document.getElementById("pace-zones").innerHTML = paceZones.map(z => `
    <div class="zone-row">
      <div class="zone-bar ${z.cls}"></div>
      <div>
        <div class="zone-name">${z.name}</div>
        <div class="zone-detail">${z.desc}</div>
      </div>
      <div class="zone-range">${secToPace(z.max)} – ${secToPace(z.min)}</div>
    </div>
  `).join("");

  // HR zones (% of LTHR)
  const hrZones = [
    { name: "Z1 Recovery", desc: "< 80% LTHR", min: 0, max: Math.round(lthr * 0.80), cls: "recovery" },
    { name: "Z2 Aerobic", desc: "81-89% LTHR", min: Math.round(lthr * 0.81), max: Math.round(lthr * 0.89), cls: "aerobic" },
    { name: "Z3 Tempo", desc: "90-94% LTHR", min: Math.round(lthr * 0.90), max: Math.round(lthr * 0.94), cls: "power" },
    { name: "Z4 Threshold", desc: "95-100% LTHR", min: Math.round(lthr * 0.95), max: lthr, cls: "threshold" },
    { name: "Z5 VO2", desc: "101-105% LTHR", min: lthr + 1, max: Math.round(lthr * 1.05), cls: "anaerobic" },
    { name: "Z5+ Max", desc: "> 105% LTHR", min: Math.round(lthr * 1.05) + 1, max: mhr, cls: "sprint" }
  ];
  document.getElementById("hr-zones").innerHTML = hrZones.map(z => `
    <div class="zone-row">
      <div class="zone-bar ${z.cls}"></div>
      <div>
        <div class="zone-name">${z.name}</div>
        <div class="zone-detail">${z.desc}</div>
      </div>
      <div class="zone-range">${z.min}–${z.max} bpm</div>
    </div>
  `).join("");

  // Race paces
  const racePaces = [
    { distance: "5k", time: predictRiegel("hm", 5, state.profile.prs.hm), label: "5k race" },
    { distance: "10k", time: predictRiegel("hm", 10, state.profile.prs.hm), label: "10k race" },
    { distance: "Halvmarathon (mål)", time: state.profile.goalTime, label: "21.1k race", goal: true },
    { distance: "Marathon estimat", time: predictRiegel("hm", 42.195, state.profile.goalTime), label: "42.2k race" }
  ];
  document.getElementById("race-paces").innerHTML = racePaces.map(rp => {
    const totalSec = timeToSec(rp.time);
    const km = rp.distance === "5k" ? 5 : rp.distance === "10k" ? 10 : rp.distance.includes("alv") ? 21.0975 : 42.195;
    const pace = secToPace(Math.round(totalSec / km));
    return `
      <div class="race-pace-row" style="${rp.goal ? "border:1px solid var(--accent);" : ""}">
        <div class="race-pace-target">${rp.distance}</div>
        <div class="race-pace-time">${rp.time}</div>
        <div class="race-pace-pace">${pace} /km</div>
      </div>
    `;
  }).join("");
}

function predictRiegel(fromKey, toDistKm, fromTime) {
  // Riegel: T2 = T1 * (D2/D1)^1.06
  const fromDistKm = { "5k": 5, "10k": 10, "hm": 21.0975, "m": 42.195 }[fromKey];
  const t1 = timeToSec(fromTime);
  const t2 = t1 * Math.pow(toDistKm / fromDistKm, 1.06);
  return secToTime(t2);
}

// ============================================================
// LOGGER
// ============================================================
function renderLogger() {
  const dateInput = document.querySelector('#log-form input[name="date"]');
  if (dateInput && !dateInput.value) dateInput.value = todayISO();
  renderLogList();
  renderWeeklySummary();
}

function renderLogList() {
  const sorted = [...state.logs].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) {
    document.getElementById("log-list").innerHTML = `<p class="muted">Endnu ingen pas logget. Log dit første pas i formularen til venstre.</p>`;
    return;
  }
  const html = sorted.slice(0, 20).map((log, idx) => {
    const painLocations = {
      "itbs-l": "ITBS V", "itbs-r": "ITBS H", "itbs-both": "ITBS bilat",
      "patellar": "patellar", "shin-l": "shin V", "shin-r": "shin H",
      "shin-both": "shin bilat", "other": "andet"
    };
    return `
    <div class="log-entry">
      <div class="log-date">${formatDate(log.date)}</div>
      <div class="log-main">
        <div class="log-type-row">${tagFor(log.type)} <strong>${log.km || ""}${log.km ? " km" : ""}</strong> ${log.time ? "· " + log.time : ""}</div>
        <div class="log-stats">
          ${log.hr ? `❤ ${log.hr} bpm · ` : ""}
          ${log.cadence ? `${log.cadence} spm · ` : ""}
          ${log.rpe ? `RPE ${log.rpe}/10 · ` : ""}
          ${log.hrv ? `HRV ${log.hrv}ms · ` : ""}
          ${log.pain > 0 ? `🩹 ${log.pain}/10${log.painLocation ? ' (' + (painLocations[log.painLocation] || log.painLocation) + ')' : ''}` : ""}
        </div>
        ${log.notes ? `<div class="log-notes">"${log.notes}"</div>` : ""}
      </div>
      <div class="log-actions">
        <button class="log-delete" data-idx="${idx}" title="Slet">✕</button>
      </div>
    </div>
  `;
  }).join("");
  document.getElementById("log-list").innerHTML = html;

  document.querySelectorAll(".log-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const sortedLogs = [...state.logs].sort((a, b) => b.date.localeCompare(a.date));
      const log = sortedLogs[parseInt(btn.dataset.idx)];
      const logId = log.id;
      state.logs = state.logs.filter(l => l !== log);
      saveLogs();
      sbDeleteLog(logId); // async sletning fra Supabase
      renderLogger();
    });
  });
}

function renderWeeklySummary() {
  // Last 7 days
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  const weekLogs = state.logs.filter(l => new Date(l.date) >= weekAgo);

  const totalKm = weekLogs.reduce((s, l) => s + (parseFloat(l.km) || 0), 0);
  const totalRuns = weekLogs.filter(l => ["easy", "long", "tempo", "threshold", "intervals", "racepace"].includes(l.type)).length;
  const avgHr = weekLogs.filter(l => l.hr).reduce((s, l, _, arr) => s + parseFloat(l.hr) / arr.length, 0);
  const maxPain = Math.max(0, ...weekLogs.map(l => parseFloat(l.pain) || 0));

  document.getElementById("logger-week-meta").textContent = `Sidste 7 dage`;
  document.getElementById("weekly-summary").innerHTML = `
    <div class="weekly-stats">
      <div class="weekly-stat">
        <div class="weekly-stat-label">Distance</div>
        <div class="weekly-stat-value">${totalKm.toFixed(1)} <span style="font-size:14px;color:var(--text-dim)">km</span></div>
      </div>
      <div class="weekly-stat">
        <div class="weekly-stat-label">Pas</div>
        <div class="weekly-stat-value">${totalRuns}</div>
      </div>
      <div class="weekly-stat">
        <div class="weekly-stat-label">Snitpuls</div>
        <div class="weekly-stat-value">${avgHr ? Math.round(avgHr) : "—"}</div>
      </div>
      <div class="weekly-stat">
        <div class="weekly-stat-label">Max smerte</div>
        <div class="weekly-stat-value" style="color:${maxPain > 5 ? "var(--accent)" : "inherit"}">${maxPain || "0"}<span style="font-size:14px;color:var(--text-dim)">/10</span></div>
      </div>
    </div>
  `;
}

function setupLogForm() {
  document.getElementById("log-form").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const newLog = { ...data, id: Date.now() };
    state.logs.push(newLog);
    saveLogs();
    sbInsertLog(newLog); // async push til Supabase — opdaterer ID til UUID
    form.reset();
    document.querySelector('#log-form input[name="date"]').value = todayISO();
    renderLogger();
  });
}

// ============================================================
// PREHAB / BODY MAP
// ============================================================
function renderPrehab() {
  document.getElementById("body-map-wrap").innerHTML = bodyMapSVG();
  document.querySelectorAll(".body-zone").forEach(z => {
    z.addEventListener("click", () => {
      const zoneId = z.dataset.zone;
      showBodyZone(zoneId);
      document.querySelectorAll(".body-zone").forEach(z2 => z2.classList.remove("active"));
      z.classList.add("active");
    });
  });

  // Default: show IT band
  showBodyZone("itband");
  document.querySelector('[data-zone="itband"]')?.classList.add("active");

  renderDailyRoutine();
}

function bodyMapSVG() {
  return `
    <svg class="body-map" viewBox="0 0 220 420" xmlns="http://www.w3.org/2000/svg">
      <!-- Head -->
      <circle cx="110" cy="34" r="22" class="body-base"/>
      <!-- Torso -->
      <path d="M 75 60 L 145 60 L 152 170 L 68 170 Z" class="body-base"/>
      <!-- Core overlay (clickable) -->
      <rect x="85" y="105" width="50" height="55" rx="6" class="body-zone ok" data-zone="core"/>

      <!-- Hip / Glute area -->
      <rect x="65" y="165" width="90" height="35" rx="8" class="body-zone watch" data-zone="hip"/>

      <!-- IT band / outer thigh (left side highlighted) -->
      <rect x="58" y="200" width="20" height="80" rx="4" class="body-zone pain" data-zone="itband"/>
      <rect x="142" y="200" width="20" height="80" rx="4" class="body-zone pain" data-zone="itband"/>

      <!-- Thighs (base) -->
      <path d="M 75 195 L 105 195 L 100 290 L 80 290 Z" class="body-base"/>
      <path d="M 115 195 L 145 195 L 140 290 L 120 290 Z" class="body-base"/>

      <!-- Knees -->
      <rect x="78" y="285" width="24" height="22" rx="6" class="body-zone pain" data-zone="knee"/>
      <rect x="118" y="285" width="24" height="22" rx="6" class="body-zone pain" data-zone="knee"/>

      <!-- Shins (front of lower leg) -->
      <rect x="82" y="310" width="18" height="55" rx="4" class="body-zone pain" data-zone="shin"/>
      <rect x="120" y="310" width="18" height="55" rx="4" class="body-zone pain" data-zone="shin"/>

      <!-- Lower legs base (calves visible behind) -->
      <path d="M 80 308 L 102 308 L 100 380 L 84 380 Z" class="body-base"/>
      <path d="M 118 308 L 140 308 L 136 380 L 120 380 Z" class="body-base"/>

      <!-- Calves (visible as separate clickable on side) -->
      <rect x="68" y="320" width="14" height="50" rx="4" class="body-zone watch" data-zone="calf"/>
      <rect x="138" y="320" width="14" height="50" rx="4" class="body-zone watch" data-zone="calf"/>

      <!-- Feet -->
      <ellipse cx="92" cy="395" rx="14" ry="8" class="body-base"/>
      <ellipse cx="128" cy="395" rx="14" ry="8" class="body-base"/>

      <!-- Arms (simple) -->
      <path d="M 60 70 L 50 160 L 60 165 L 75 80 Z" class="body-base"/>
      <path d="M 160 70 L 170 160 L 160 165 L 145 80 Z" class="body-base"/>
    </svg>
  `;
}

function showBodyZone(zoneId) {
  const zone = BODY_ZONES.find(z => z.id === zoneId);
  if (!zone) return;
  state.activeBodyZone = zoneId;

  document.getElementById("exercise-area-title").textContent = zone.name;
  const statusLabel = { pain: "AKTIV — behandl nu", watch: "RISIKO — forebyg", ok: "STÆRK — vedligehold" }[zone.status];
  document.getElementById("exercise-area-meta").textContent = statusLabel;

  const exercisesHtml = zone.exercises.map(exId => {
    const ex = EXERCISES[exId];
    if (!ex) return "";
    const svg = EXERCISE_SVG[ex.anim] || EXERCISE_SVG.pulse;
    return `
      <div class="exercise-item">
        <div class="exercise-anim">${svg}</div>
        <div class="exercise-content">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-meta">${ex.reps}</div>
          <div class="exercise-desc">${ex.description}</div>
          <span class="exercise-target">${ex.target}</span>
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("exercise-list").innerHTML = `
    <p class="muted" style="margin-bottom: 12px;">${zone.description}</p>
    ${exercisesHtml}
  `;
}

function renderDailyRoutine() {
  document.getElementById("daily-routine").innerHTML = DAILY_ROUTINE.map(s => `
    <div class="routine-step">
      <div class="routine-step-num">${String(s.num).padStart(2, "0")}</div>
      <div class="routine-step-name">${s.name}</div>
      <div class="routine-step-detail">${s.detail}</div>
    </div>
  `).join("");
}

// ============================================================
// AI COACH — PERSISTENT CHAT
// Maintains conversation history per session
// Sends full context (plan + logs + injuries) as system prompt
// ============================================================

const chatState = {
  history: [],   // [{role:"user"|"model", parts:[{text:"..."}]}]
  typing: false
};

const QUICK_PROMPTS = [
  "Hvordan ser min uge ud?",
  "Mit IT-bånd er flammet op — juster planen",
  "Er jeg på rette spor mod sub 1:28?",
  "Hvad er de vigtigste øvelser for min ITBS?",
  "Min cadence er kun 172 spm — hvad gør jeg?",
  "Skal jeg løbe i morgen eller hvile?",
  "Hvornår bestemmer jeg A vs B mål?",
  "Foreslå et tune-up race i uge 14"
];

function setupAi() {
  document.getElementById("ai-key").value = state.ai.key || "";
  document.getElementById("ai-model").value = state.ai.model || "gemini-2.5-flash";

  // Sidebar quick buttons
  const quickList = document.getElementById("quick-prompts");
  quickList.innerHTML = QUICK_PROMPTS.map(q =>
    `<button class="coach-quick-btn" data-q="${q}">${q}</button>`
  ).join("");
  quickList.querySelectorAll(".coach-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("ai-question").value = btn.dataset.q;
      document.getElementById("ai-question").focus();
    });
  });

  // Welcome chips (same prompts, shorter)
  const welcomeChips = document.getElementById("welcome-chips");
  if (welcomeChips) {
    const chips = QUICK_PROMPTS.slice(0, 4);
    welcomeChips.innerHTML = chips.map(q =>
      `<button class="coach-welcome-chip" data-q="${q}">${q}</button>`
    ).join("");
    welcomeChips.querySelectorAll(".coach-welcome-chip").forEach(btn => {
      btn.addEventListener("click", () => sendMessage(btn.dataset.q));
    });
  }

  document.getElementById("ai-save").addEventListener("click", () => {
    state.ai.key = document.getElementById("ai-key").value.trim();
    state.ai.model = document.getElementById("ai-model").value;
    saveAi();
    sbSaveProfile(); // synk API-nøgle til Supabase → tilgængelig på alle enheder
    updateCoachStatus();
    flash("API-key gemt og synkroniseret");
  });

  document.getElementById("ai-test").addEventListener("click", async () => {
    if (!state.ai.key) { flash("Indtast API-key først"); return; }
    flash("Tester...");
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.ai.model}:generateContent`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": state.ai.key },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Svar kun: OK" }] }] })
      });
      if (resp.ok) { flash("✓ Forbindelse OK"); updateCoachStatus(true); }
      else { const e = await resp.json(); flash("Fejl: " + (e.error?.message || resp.status)); }
    } catch (e) { flash("Netværksfejl: " + e.message); }
  });

  // Send on button click
  document.getElementById("ai-ask").addEventListener("click", () => {
    const q = document.getElementById("ai-question").value.trim();
    if (q) sendMessage(q);
  });

  // Send on Enter (Shift+Enter = newline)
  document.getElementById("ai-question").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const q = document.getElementById("ai-question").value.trim();
      if (q) sendMessage(q);
    }
  });

  // Auto-grow textarea
  document.getElementById("ai-question").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 160) + "px";
  });

  // New chat button
  document.getElementById("coach-new-chat").addEventListener("click", () => {
    if (chatState.history.length === 0) return;
    if (confirm("Start ny samtale? Historikken ryddes.")) {
      chatState.history = [];
      renderMessages();
    }
  });

  updateCoachStatus();
}

function updateCoachStatus(online = null) {
  const dot = document.getElementById("coach-status-dot");
  if (!dot) return;
  const hasKey = !!state.ai.key;
  if (online === true || hasKey) {
    dot.textContent = "● Online";
    dot.classList.add("online");
  } else {
    dot.textContent = "● Offline";
    dot.classList.remove("online");
  }
}

async function sendMessage(text) {
  if (!state.ai.key) {
    flash("Gem din Gemini API-key i sidebaren");
    document.getElementById("ai-key").focus();
    return;
  }
  if (chatState.typing) return;

  // Clear input
  const inputEl = document.getElementById("ai-question");
  inputEl.value = "";
  inputEl.style.height = "auto";

  // Add user message to history and render
  chatState.history.push({ role: "user", parts: [{ text }] });
  renderMessages();

  // Show typing indicator
  chatState.typing = true;
  document.getElementById("ai-ask").disabled = true;
  showTyping();

  try {
    const responseText = await callGeminiChat(chatState.history);
    const patch = parsePlanPatch(responseText);
    const cleanText = patch ? stripPatchFromText(responseText) : responseText;
    // Store clean text in history (without the JSON block)
    chatState.history.push({ role: "model", parts: [{ text: cleanText }] });
    // If there's a patch, attach it as metadata to the last message
    if (patch) {
      chatState.history[chatState.history.length - 1]._patch = patch;
      chatState.history[chatState.history.length - 1]._proposalId = `patch-${Date.now()}`;
    }
  } catch (e) {
    chatState.history.push({
      role: "model",
      parts: [{ text: `Fejl: ${e.message}\n\nTjek at din API-key er korrekt og at du har internet-forbindelse.` }]
    });
  } finally {
    chatState.typing = false;
    document.getElementById("ai-ask").disabled = false;
  }

  renderMessages(); // calls attachPatchListeners internally
}

function renderMessages() {
  const container = document.getElementById("coach-messages");
  if (!container) return;

  if (chatState.history.length === 0) {
    // Show welcome state
    container.innerHTML = `
      <div class="coach-welcome">
        <div class="coach-welcome-icon">▲</div>
        <div class="coach-welcome-title">Hej — jeg er din AI Coach</div>
        <div class="coach-welcome-text">
          Jeg kender din plan, dine skader (bilateral ITBS + shinsplints), dine PRs og dine seneste pas.
          Spørg om hvad som helst — fra justeringer af denne uges plan til race-day strategi.
        </div>
        <div class="coach-welcome-chips" id="welcome-chips"></div>
      </div>`;
    // Re-attach chip listeners
    const chips = QUICK_PROMPTS.slice(0, 4);
    document.getElementById("welcome-chips").innerHTML = chips.map(q =>
      `<button class="coach-welcome-chip" data-q="${q}">${q}</button>`
    ).join("");
    document.querySelectorAll(".coach-welcome-chip").forEach(btn => {
      btn.addEventListener("click", () => sendMessage(btn.dataset.q));
    });
    return;
  }

  const messagesHtml = chatState.history.map(msg => {
    const isUser = msg.role === "user";
    const text = msg.parts[0].text;
    const time = formatMessageTime();
    const patchHtml = (!isUser && msg._patch && msg._proposalId && !msg._patchResolved)
      ? buildPatchProposalHtml(msg._patch, msg._proposalId) : "";
    return `
      <div class="chat-msg ${isUser ? "user" : "coach"}">
        <div class="chat-msg-avatar">${isUser ? "DU" : "▲"}</div>
        <div class="chat-msg-body">
          <div class="chat-msg-bubble">${isUser ? escapeHtml(text) : renderMarkdownLight(text)}</div>
          ${patchHtml}
          <div class="chat-msg-time">${time}</div>
        </div>
      </div>`;
  }).join("");

  container.innerHTML = messagesHtml;
  scrollToBottom();
  attachPatchListeners();
}

function attachPatchListeners() {
  document.querySelectorAll(".patch-btn.approve").forEach(btn => {
    btn.addEventListener("click", () => {
      const proposalId = btn.dataset.proposal;
      const msg = chatState.history.find(m => m._proposalId === proposalId);
      if (!msg || msg._patchResolved) return;
      applyPlanPatch(msg._patch);
      msg._patchResolved = "approved";
      const el = document.getElementById(proposalId);
      if (el) el.innerHTML = `<div class="patch-approved">✓ Ændring godkendt — planen er opdateret. Se Plan-tabben.</div>`;
    });
  });
  document.querySelectorAll(".patch-btn.reject").forEach(btn => {
    btn.addEventListener("click", () => {
      const proposalId = btn.dataset.proposal;
      const msg = chatState.history.find(m => m._proposalId === proposalId);
      if (!msg || msg._patchResolved) return;
      msg._patchResolved = "rejected";
      const el = document.getElementById(proposalId);
      if (el) el.innerHTML = `<div class="patch-rejected">✗ Afvist — planen er uændret.</div>`;
    });
  });
}

function showTyping() {
  const container = document.getElementById("coach-messages");
  if (!container) return;
  const existing = container.querySelector(".chat-typing");
  if (existing) return;
  const div = document.createElement("div");
  div.className = "chat-msg coach chat-typing";
  div.innerHTML = `
    <div class="chat-msg-avatar">▲</div>
    <div class="chat-msg-body">
      <div class="chat-msg-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>`;
  container.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  const container = document.getElementById("coach-messages");
  if (container) {
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdownLight(text) {
  // Minimal markdown: **bold**, *italic*, `code`, line breaks
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

function formatMessageTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// ============================================================
// AI PLAN PATCH — parse, display, apply/reject
// ============================================================

const PATCH_MARKER = "PLAN_PATCH:";

function parsePlanPatch(text) {
  const idx = text.indexOf(PATCH_MARKER);
  if (idx === -1) return null;
  const jsonStr = text.slice(idx + PATCH_MARKER.length).trim();
  try {
    const obj = JSON.parse(jsonStr);
    if (!obj.changes || !Array.isArray(obj.changes)) return null;
    return obj; // { reason, changes: [{week, day, field, from, to}] }
  } catch (e) {
    return null;
  }
}

function stripPatchFromText(text) {
  const idx = text.indexOf(PATCH_MARKER);
  return idx === -1 ? text : text.slice(0, idx).trim();
}

function applyPlanPatch(patch) {
  const dayLabels = { mon: "MAN", tue: "TIR", wed: "ONS", thu: "TOR", fri: "FRE", sat: "LØR", sun: "SØN" };
  patch.changes.forEach(c => {
    const key = `wk${c.week}-${c.day}`;
    if (!state.planOverrides[key]) state.planOverrides[key] = {};
    state.planOverrides[key][c.field] = c.to;
  });
  savePlanOverrides();
  renderWeeks(document.querySelector(".phase-tab.active")?.dataset.phase || "all");
}

function rejectPlanPatch(proposalEl) {
  proposalEl.innerHTML = `<div class="patch-rejected">Ændring afvist — planen er uændret.</div>`;
}

function buildPatchProposalHtml(patch, proposalId) {
  const dayLabels = { mon: "MAN", tue: "TIR", wed: "ONS", thu: "TOR", fri: "FRE", sat: "LØR", sun: "SØN" };
  const fieldLabels = { detail: "Beskrivelse", km: "Kilometer", title: "Titel", type: "Type" };

  const changesHtml = patch.changes.map(c => `
    <div class="patch-change">
      <div class="patch-loc">Uge ${c.week} · ${dayLabels[c.day] || c.day} — ${fieldLabels[c.field] || c.field}</div>
      <div class="patch-from">Fra: <span>${c.from}</span></div>
      <div class="patch-to">Til: <span>${c.to}</span></div>
    </div>`).join("");

  return `
    <div class="patch-proposal" id="${proposalId}">
      <div class="patch-header">
        <div class="patch-icon">✎</div>
        <div>
          <div class="patch-title">AI foreslår en planændring</div>
          <div class="patch-reason">${escapeHtml(patch.reason)}</div>
        </div>
      </div>
      <div class="patch-changes">${changesHtml}</div>
      <div class="patch-actions">
        <button class="patch-btn approve" data-proposal="${proposalId}">✓ Godkend</button>
        <button class="patch-btn reject" data-proposal="${proposalId}">✗ Afvis</button>
      </div>
    </div>`;
}

async function callGeminiChat(history) {
  const model = state.ai.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // System context injected as first user turn + model ack
  const systemContext = buildAiContext();
  const systemPreamble = [
    {
      role: "user",
      parts: [{ text: `Du er en erfaren løbecoach med baggrund i fysiologi og fysioterapi. Svar ALTID på dansk. Vær præcis, handlingsorienteret og empatisk. Undgå lange lister — tal direkte til løberen. Her er al kontekst om løberen:\n\n${systemContext}\n\n---\nPLANÆNDRINGS-INSTRUKTIONER:\nHvis du konkret anbefaler at ændre et specifikt pas i planen (fx reducere distance, skifte type, ændre beskrivelse), skal du SIDST i dit svar tilføje en PLAN_PATCH-blok i præcis dette format (kun én blok per svar):\n\nPLAN_PATCH:\n{"reason":"Kort begrundelse på dansk","changes":[{"week":2,"day":"tue","field":"detail","from":"original tekst","to":"ny tekst"},{"week":2,"day":"tue","field":"km","from":4,"to":3}]}\n\nTilladte field-værdier: "detail", "km", "title", "type"\nBrug kun integer/decimal for km, string for alle andre.\nInkluder KUN PLAN_PATCH-blokken hvis du foreslår en konkret ændring til et specifikt pas. Generelle råd, analyser og svar på spørgsmål skal IKKE have en PLAN_PATCH-blok.\nBrugeren godkender eller afviser — ændringen sker ALDRIG automatisk.` }]
    },
    {
      role: "model",
      parts: [{ text: "Forstået — jeg er klar som coach. Hvad vil du gerne vide?" }]
    }
  ];

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": state.ai.key },
    body: JSON.stringify({
      contents: [...systemPreamble, ...history],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error?.message || `HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Ingen respons fra modellen.";
}

// ---- Build system context for Gemini ----
// Samler al relevant løber-data: profil, plan, skader, logs og compliance
function buildAiContext() {
  const p = state.profile;
  const weekNum = getCurrentWeekNum();
  const currentWeek = TRAINING_PLAN[weekNum - 1];
  const recentLogs = [...state.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
  const compliance = calcWeekCompliance(weekNum);
  const acwr = calcACWR();
  const overall = calcOverallCompliance();

  const logsText = recentLogs.length
    ? recentLogs.map(l =>
      `  ${l.date}: ${l.type} ${l.km ? l.km + "km" : ""} ${l.time ? l.time : ""} RPE:${l.rpe || "?"} HRV:${l.hrv || "?"} smerte:${l.pain || 0}/10${l.painLocation ? " (" + l.painLocation + ")" : ""}${l.notes ? ' — "' + l.notes + '"' : ""}`
    ).join("\n")
    : "  Ingen pas logget endnu.";

  const planText = currentWeek
    ? currentWeek.workouts.map(w => `  ${w.day.toUpperCase()}: ${w.title} — ${w.detail}`).join("\n")
    : "Ingen plan for denne uge.";

  return `
LØBERPROFIL:
- Mål: sub 1:28 CPH Half Marathon 20. sep 2026
- Threshold pace: ${p.thresholdPace}/km | LTHR: ${p.lthr} | MaxHR: ${p.maxHr} | Hvilepuls: ${p.restingHr}
- PRs: 5k ${p.prs["5k"]} | 10k ${p.prs["10k"]} | HM ${p.prs.hm} | Marathon ${p.prs.m}
- Coros forudsiger HM: ${p.corosPredict.hm}

AKTIVE SKADER:
- Bilateral ITBS (højre værre), patellofemoral tendinopati (mild), shinsplints
- Skadet siden feb 2026 | Marathon 10. maj 2026 (3:34:29)

TRÆNINGSSTATUS:
- Plan uge: ${weekNum}/17 (${currentWeek?.title || "—"})
- ACWR: ${acwr !== null ? acwr.toFixed(2) : "ingen data"} (sweet spot: 0.8–1.3)
- Compliance denne uge: ${compliance ? compliance.done + "/" + compliance.planned + " pas" : "ingen data"}
- Samlet compliance: ${overall !== null ? overall + "%" : "ingen data"}

DENNE UGES PLAN:
${planText}

SENESTE 10 PAS:
${logsText}
`.trim();
}

// ============================================================
// SUPABASE AUTH & SYNC
// Magic link login — ingen adgangskode nødvendig
// Hybrid model: localStorage som lokal cache, Supabase som kilde til sandhed
// ============================================================

function showAuthOverlay() {
  const el = document.getElementById("auth-overlay");
  if (el) el.classList.add("visible");
}
function hideAuthOverlay() {
  const el = document.getElementById("auth-overlay");
  if (el) el.classList.remove("visible");
}

function updateSyncStatus(status) {
  // status: "offline" | "syncing" | "synced" | "error" | "queued"
  const dot = document.getElementById("sync-dot");
  if (!dot) return;
  dot.className = "sync-dot";
  if (status !== "offline") dot.classList.add(status);
  const titles = { offline: "Ikke logget ind", syncing: "Synkroniserer...", synced: "Data synkroniseret", error: "Synkroniseringsfejl", queued: "Ændringer venter på net — synkes automatisk" };
  dot.title = titles[status] || status;
}

// Konverter Supabase-række til lokalt log-objekt
function dbLogToLocal(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type || "",
    km: row.km || "",
    time: row.time_str || "",
    hr: row.hr || "",
    cadence: row.cadence || "",
    rpe: row.rpe || "",
    hrv: row.hrv || "",
    pain: row.pain || "",
    painLocation: row.pain_location || "",
    notes: row.notes || ""
  };
}

// Konverter lokalt log-objekt til Supabase-format
function localLogToDb(log) {
  return {
    user_id: currentUser.id,
    date: log.date,
    type: log.type || null,
    km: log.km ? parseFloat(log.km) : null,
    time_str: log.time || null,
    hr: log.hr ? parseInt(log.hr) : null,
    cadence: log.cadence ? parseInt(log.cadence) : null,
    rpe: log.rpe ? parseInt(log.rpe) : null,
    hrv: log.hrv ? parseInt(log.hrv) : null,
    pain: log.pain ? parseInt(log.pain) : null,
    pain_location: log.painLocation || null,
    notes: log.notes || null
  };
}

// Hent alle data fra Supabase og opdater lokal state
async function loadFromSupabase() {
  if (!currentUser) return;
  updateSyncStatus("syncing");
  const uid = currentUser.id;

  try {
    const [logsRes, profileRes, completedRes] = await Promise.all([
      sb.from("logs").select("*").eq("user_id", uid).order("date", { ascending: false }),
      sb.from("profile").select("*").eq("user_id", uid).maybeSingle(),
      sb.from("completed_workouts").select("key").eq("user_id", uid)
    ]);

    // LOGS
    if (logsRes.data && logsRes.data.length > 0) {
      state.logs = logsRes.data.map(dbLogToLocal);
      saveLogs();
    } else if (state.logs.length > 0) {
      // Første login — migrer lokale logs til Supabase
      await migrateLocalLogs();
    }

    // PROFIL
    if (profileRes.data?.data) {
      const { _ai, ...profileData } = profileRes.data.data;
      state.profile = { ...RUNNER_DEFAULTS, ...profileData };
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.profile));
      // Gendan AI-indstillinger (inkl. API-nøgle) fra Supabase
      if (_ai) {
        state.ai = { ...state.ai, ..._ai };
        saveAi();
      }
    } else {
      // Første login — migrer profil
      await sbSaveProfile();
    }

    // GENNEMFØRTE PAS
    if (completedRes.data) {
      state.completed = {};
      completedRes.data.forEach(c => { state.completed[c.key] = true; });
      localStorage.setItem(STORAGE_KEYS.completedWorkouts, JSON.stringify(state.completed));
    }

    updateSyncStatus("synced");
  } catch (err) {
    console.error("Supabase load fejl:", err);
    updateSyncStatus("error");
  }
}

// Migrer eksisterende localStorage-logs til Supabase (bruges kun ved første login)
async function migrateLocalLogs() {
  if (state.logs.length === 0) return;
  const rows = state.logs.map(localLogToDb);
  const { data, error } = await sb.from("logs").insert(rows).select();
  if (error) { console.warn("Migration fejl:", error); return; }
  if (data) {
    // Opdater lokale IDs til Supabase UUIDs
    state.logs = data.map(dbLogToLocal);
    saveLogs();
  }
}

// ============================================================
// OFFLINE SYNC-KØ
// Fejlede writes (fx pga. manglende net) gemmes i localStorage
// og retryes automatisk når forbindelsen er tilbage.
// ============================================================
const SYNC_QUEUE_KEY = "sub128.syncQueue";

function loadSyncQueue() {
  try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)) || []; }
  catch { return []; }
}
function saveSyncQueue(q) { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(q)); }

function enqueueSync(item) {
  let q = loadSyncQueue();
  // Dedup: kun seneste profil-gem er relevant (læser state ved flush)
  if (item.op === "saveProfile") q = q.filter(i => i.op !== "saveProfile");
  // Dedup: toggle af samme pas ophæver tidligere op for samme key
  if (item.op === "insertCompleted" || item.op === "deleteCompleted") {
    q = q.filter(i => !((i.op === "insertCompleted" || i.op === "deleteCompleted") && i.key === item.key));
  }
  // Slettes et log der stadig venter på insert, fjernes insert blot fra køen
  if (item.op === "deleteLog") {
    const pendingIdx = q.findIndex(i => i.op === "insertLog" && i.log?.id === item.id);
    if (pendingIdx !== -1) { q.splice(pendingIdx, 1); saveSyncQueue(q); updateSyncStatus("queued"); return; }
  }
  q.push(item);
  saveSyncQueue(q);
  updateSyncStatus("queued");
}

// Udfør én kø-operation — returnerer true ved succes
async function execSyncOp(item) {
  switch (item.op) {
    case "insertLog":       return await execInsertLog(item.log);
    case "deleteLog":       return await execDeleteLog(item.id);
    case "saveProfile":     return await execSaveProfile();
    case "insertCompleted": return await execInsertCompleted(item.key);
    case "deleteCompleted": return await execDeleteCompleted(item.key);
    default: return true; // ukendt op — drop den
  }
}

let flushing = false;
async function flushSyncQueue() {
  if (flushing || !currentUser || !navigator.onLine) return;
  let q = loadSyncQueue();
  if (q.length === 0) return;
  flushing = true;
  updateSyncStatus("syncing");
  try {
    while (q.length > 0) {
      const ok = await execSyncOp(q[0]);
      if (!ok) { updateSyncStatus("queued"); return; } // stadig fejl — prøv senere
      q.shift();
      saveSyncQueue(q);
    }
    updateSyncStatus("synced");
  } finally {
    flushing = false;
  }
}

window.addEventListener("online", () => flushSyncQueue());

// ============================================================
// SUPABASE WRITES — exec* rammer netværket, sb* wrapper med kø-fallback
// ============================================================

// Insert ét nyt log — opdaterer lokalt ID med Supabase UUID
async function execInsertLog(log) {
  const { data, error } = await sb.from("logs").insert(localLogToDb(log)).select().single();
  if (error) { console.warn("Log insert fejl:", error); return false; }
  if (data) {
    // Erstat den lokale log (fundet ved midlertidig Date.now() id) med Supabase UUID
    const idx = state.logs.findIndex(l => l.id === log.id);
    if (idx !== -1) {
      state.logs[idx].id = data.id;
      saveLogs();
    }
  }
  return true;
}

async function sbInsertLog(log) {
  if (!currentUser) return;
  if (!navigator.onLine) { enqueueSync({ op: "insertLog", log }); return; }
  const ok = await execInsertLog(log);
  if (!ok) enqueueSync({ op: "insertLog", log });
}

// Slet ét log
async function execDeleteLog(id) {
  const { error } = await sb.from("logs").delete().eq("id", id).eq("user_id", currentUser.id);
  if (error) { console.warn("Log delete fejl:", error); return false; }
  return true;
}

async function sbDeleteLog(id) {
  if (!currentUser) return;
  if (!navigator.onLine) { enqueueSync({ op: "deleteLog", id }); return; }
  const ok = await execDeleteLog(id);
  if (!ok) enqueueSync({ op: "deleteLog", id });
}

// Gem/opdater profil — inkl. AI-indstillinger så de synker på tværs af enheder
async function execSaveProfile() {
  const { error } = await sb.from("profile").upsert({
    user_id: currentUser.id,
    data: { ...state.profile, _ai: state.ai },
    updated_at: new Date().toISOString()
  });
  if (error) { console.warn("Profile upsert fejl:", error); return false; }
  return true;
}

async function sbSaveProfile() {
  if (!currentUser) return;
  if (!navigator.onLine) { enqueueSync({ op: "saveProfile" }); return; }
  const ok = await execSaveProfile();
  if (ok) updateSyncStatus("synced");
  else enqueueSync({ op: "saveProfile" });
}

// Tilføj gennemført pas
async function execInsertCompleted(key) {
  const { error } = await sb.from("completed_workouts").upsert({ user_id: currentUser.id, key });
  if (error) { console.warn("Completed insert fejl:", error); return false; }
  return true;
}

async function sbInsertCompleted(key) {
  if (!currentUser) return;
  if (!navigator.onLine) { enqueueSync({ op: "insertCompleted", key }); return; }
  const ok = await execInsertCompleted(key);
  if (!ok) enqueueSync({ op: "insertCompleted", key });
}

// Fjern gennemført pas
async function execDeleteCompleted(key) {
  const { error } = await sb.from("completed_workouts").delete()
    .eq("user_id", currentUser.id).eq("key", key);
  if (error) { console.warn("Completed delete fejl:", error); return false; }
  return true;
}

async function sbDeleteCompleted(key) {
  if (!currentUser) return;
  if (!navigator.onLine) { enqueueSync({ op: "deleteCompleted", key }); return; }
  const ok = await execDeleteCompleted(key);
  if (!ok) enqueueSync({ op: "deleteCompleted", key });
}

// Auth-opsætning: magic link flow + onAuthStateChange
async function setupAuth() {
  // Magic link form
  const sendBtn = document.getElementById("auth-send");
  const emailEl = document.getElementById("auth-email");
  const msgEl = document.getElementById("auth-msg");

  const passwordEl = document.getElementById("auth-password");

  const doLogin = async () => {
    const email    = emailEl?.value.trim();
    const password = passwordEl?.value;
    if (!email || !password) { if (msgEl) msgEl.textContent = "Udfyld email og adgangskode."; return; }
    sendBtn.disabled = true;
    if (msgEl) { msgEl.textContent = "Logger ind..."; msgEl.style.color = "var(--text-dim)"; }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (msgEl) { msgEl.textContent = "Fejl: forkert email eller adgangskode."; msgEl.style.color = "var(--accent)"; }
      sendBtn.disabled = false;
    }
    // Ved succes håndteres alt af onAuthStateChange nedenfor
  };

  sendBtn?.addEventListener("click", doLogin);
  // Enter-tast i begge felter
  emailEl?.addEventListener("keydown",    e => { if (e.key === "Enter") doLogin(); });
  passwordEl?.addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

  // Render plan/prehab/dashboard immediately from localStorage — auth-uafhængigt
  // Supabase-sync sker ovenpå når brugeren logger ind
  renderAll();

  // Lyt på auth-ændringer (login, logout, token-refresh)
  sb.auth.onAuthStateChange(async (event, session) => {
    currentUser = session?.user ?? null;
    if (currentUser) {
      hideAuthOverlay();
      updateSyncStatus("syncing");
      await flushSyncQueue();   // push ventende offline-writes FØR server-data hentes
      await loadFromSupabase();
      renderAll(); // re-render med Supabase-data
    } else {
      showAuthOverlay();
      updateSyncStatus("offline");
      // renderAll() allerede kaldt ovenfor — plan er synlig bag overlay
    }
  });
}

// Keep old showAiResponse for backwards compat (used by test button)
function showAiResponse(text, loading = false) {
  flash(loading ? text : text.slice(0, 60) + "…");
}

// ============================================================
// FREMSKRIDT — ACWR, COMPLIANCE, INJURY TREND, CHARTS
// Evidensbase:
//   ACWR: Gabbett et al. 2016 (Br J Sports Med) — sweet spot 0.8–1.3
//   sRPE TRIMP: Foster et al. 2001 — RPE × varighed (min)
//   Injury NRS: standardiseret numerisk smerteskala 0–10
//   Trafiklysgrænserne: kliniske ITBS/patellofemoral retningslinjer
// ============================================================

const chartRegistry = {};
function destroyChart(id) {
  if (chartRegistry[id]) { chartRegistry[id].destroy(); delete chartRegistry[id]; }
}

function setupChartDefaults() {
  if (typeof Chart === "undefined") return;
  Chart.defaults.color = "#a0a0b0";
  Chart.defaults.font.family = "'Geist', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

// sRPE TRIMP (Foster et al. 2001): RPE × varighed (min)
function calcSrpeTrimp(log) {
  const rpe = parseFloat(log.rpe) || 5;
  let minutes = 0;
  if (log.time && log.time.trim()) {
    minutes = timeToSec(log.time) / 60;
  } else if (log.km) {
    const secPerKm = { easy: 330, long: 330, tempo: 275, threshold: 268, intervals: 255, racepace: 250, cross: 300, strides: 300 };
    minutes = (parseFloat(log.km) * (secPerKm[log.type] || 330)) / 60;
  }
  return rpe * minutes;
}

// ACWR (Gabbett 2016): Akut (7d sRPE-TRIMP) / Kronisk (28d rullende snit)
function calcACWR(refDateISO) {
  const refDate = refDateISO ? new Date(refDateISO) : new Date();
  let acuteLoad = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(refDate); d.setDate(refDate.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    state.logs.filter(l => l.date === iso).forEach(l => { acuteLoad += calcSrpeTrimp(l); });
  }
  const weeklyLoads = [];
  for (let w = 0; w < 4; w++) {
    let wl = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(refDate); day.setDate(refDate.getDate() - w * 7 - d);
      const iso = day.toISOString().slice(0, 10);
      state.logs.filter(l => l.date === iso).forEach(l => { wl += calcSrpeTrimp(l); });
    }
    weeklyLoads.push(wl);
  }
  const chronic = weeklyLoads.reduce((a, b) => a + b, 0) / 4;
  return chronic > 5 ? Math.round((acuteLoad / chronic) * 100) / 100 : null;
}

function acwrStatusText(acwr) {
  if (acwr === null) return { text: "Logger pas for at beregne ACWR", cls: "" };
  if (acwr < 0.6) return { text: "For lav — du kan godt øge volumen", cls: "blue" };
  if (acwr < 0.8) return { text: "Under sweet spot — let stigning OK", cls: "blue" };
  if (acwr <= 1.3) return { text: "Sweet spot — fortsæt som planlagt", cls: "green" };
  if (acwr <= 1.5) return { text: "Lidt høj — vær forsigtig med intensitet", cls: "amber" };
  return { text: "RISIKO — reducer belastning nu", cls: "accent" };
}

function calcWeekCompliance(weekNum) {
  const week = TRAINING_PLAN[weekNum - 1];
  if (!week) return null;
  const planned = week.workouts.filter(w => w.type !== "rest" && w.type !== "prehab");
  const done = planned.filter(w => !!state.completed[`wk${weekNum}-${w.day}`]);
  return { planned: planned.length, done: done.length, pct: planned.length > 0 ? Math.round(done.length / planned.length * 100) : 100 };
}

function calcOverallCompliance() {
  const cur = getCurrentWeekNum();
  let tp = 0, td = 0;
  for (let w = 1; w < cur; w++) {
    const c = calcWeekCompliance(w);
    if (c) { tp += c.planned; td += c.done; }
  }
  return tp > 0 ? Math.round(td / tp * 100) : null;
}

function getInjuryTrendData() {
  const today = new Date();
  const labels = [], itbs = [], shin = [], knee = [];
  for (let w = 3; w >= 0; w--) {
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() - w * 7);
    const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6);
    const wLogs = state.logs.filter(l => { const d = new Date(l.date); return d >= weekStart && d <= weekEnd && parseFloat(l.pain) > 0; });
    const max = zone => { const zl = wLogs.filter(l => l.painLocation?.includes(zone)); return zl.length ? Math.max(...zl.map(l => parseFloat(l.pain))) : 0; };
    itbs.push(max("itbs")); shin.push(max("shin")); knee.push(max("patellar"));
    const d = new Date(weekEnd); labels.push(w === 0 ? "Nu" : `${d.getDate()}/${d.getMonth() + 1}`);
  }
  return { labels, itbs, shin, knee };
}

function getWeeklyVolumeData() {
  const today = new Date();
  const labels = [], actual = [], planned = [];
  for (let w = 7; w >= 0; w--) {
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() - w * 7);
    const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6);
    const wLogs = state.logs.filter(l => { const d = new Date(l.date); return d >= weekStart && d <= weekEnd && ["easy", "long", "tempo", "threshold", "intervals", "racepace", "strides"].includes(l.type); });
    const km = wLogs.reduce((s, l) => s + (parseFloat(l.km) || 0), 0);
    const dFromStart = daysBetween(state.profile.startDate, weekEnd.toISOString().slice(0, 10));
    const pWk = TRAINING_PLAN[Math.min(Math.max(Math.floor(dFromStart / 7), 0), 16)];
    const planKm = pWk ? pWk.workouts.reduce((s, w2) => s + (w2.km || 0), 0) : 0;
    const d = new Date(weekStart);
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    actual.push(Math.round(km * 10) / 10);
    planned.push(Math.round(planKm * 10) / 10);
  }
  return { labels, actual, planned };
}

function getACWRTrendData() {
  const today = new Date();
  const labels = [], data = [];
  for (let w = 3; w >= 0; w--) {
    const ref = new Date(today); ref.setDate(today.getDate() - w * 7);
    const acwr = calcACWR(ref.toISOString().slice(0, 10));
    const d = new Date(ref); labels.push(w === 0 ? "Nu" : `${d.getDate()}/${d.getMonth() + 1}`);
    data.push(acwr);
  }
  return { labels, data };
}

function getRpeHrvData() {
  const today = new Date();
  const labels = [], rpeData = [], hrvData = [];
  for (let d = 27; d >= 0; d--) {
    const day = new Date(today); day.setDate(today.getDate() - d);
    const iso = day.toISOString().slice(0, 10);
    const dl = state.logs.filter(l => l.date === iso);
    const rpes = dl.filter(l => l.rpe); const hrvs = dl.filter(l => l.hrv);
    const avgRpe = rpes.length ? rpes.reduce((s, l, _, a) => s + parseFloat(l.rpe) / a.length, 0) : null;
    const avgHrv = hrvs.length ? hrvs.reduce((s, l, _, a) => s + parseFloat(l.hrv) / a.length, 0) : null;
    labels.push(d % 7 === 0 ? `${day.getDate()}/${day.getMonth() + 1}` : "");
    rpeData.push(avgRpe !== null ? Math.round(avgRpe * 10) / 10 : null);
    hrvData.push(avgHrv !== null ? Math.round(avgHrv) : null);
  }
  return { labels, rpeData, hrvData };
}

function renderProgress() {
  setupChartDefaults();
  renderACWRKpi();
  renderComplianceKpi();
  renderPainKpi();
  renderComplianceWeeksGrid();
  renderChartVolume();
  renderChartInjury();
  renderChartACWR();
  renderChartRpeHrv();
}

function renderACWRKpi() {
  const acwr = calcACWR();
  const { text, cls } = acwrStatusText(acwr);
  const el = document.getElementById("acwr-value");
  const fill = document.getElementById("acwr-fill");
  const needle = document.getElementById("acwr-needle");
  const statusEl = document.getElementById("acwr-status");
  if (!el) return;
  el.textContent = acwr !== null ? acwr.toFixed(2) : "—";
  if (statusEl) { statusEl.textContent = text; statusEl.className = `stat-trend ${cls}`; }
  if (acwr !== null && fill && needle) {
    const pct = Math.min(Math.max((acwr / 2.0) * 100, 0), 100);
    needle.style.left = `calc(${pct}% - 2px)`;
    fill.style.width = `${pct}%`;
    fill.style.background = acwr <= 1.3 ? "var(--green)" : acwr <= 1.5 ? "var(--amber)" : "var(--accent)";
  }
}

function renderComplianceKpi() {
  const c = calcWeekCompliance(getCurrentWeekNum());
  const overall = calcOverallCompliance();
  const pctEl = document.getElementById("compliance-week-pct");
  const detEl = document.getElementById("compliance-week-detail");
  const barEl = document.getElementById("compliance-bar-inner");
  const ovEl = document.getElementById("compliance-overall");
  if (!pctEl || !c) return;
  pctEl.textContent = `${c.pct}%`;
  if (detEl) detEl.textContent = `${c.done} / ${c.planned} pas gennemført`;
  if (barEl) {
    barEl.style.width = `${c.pct}%`;
    barEl.style.background = c.pct >= 80 ? "var(--green)" : c.pct >= 50 ? "var(--amber)" : "var(--accent)";
  }
  if (ovEl) ovEl.textContent = overall !== null ? `Samlet plan (uge 1–${getCurrentWeekNum() - 1}): ${overall}%` : "Markér pas i Plan-fanen";
}

function renderPainKpi() {
  const today = new Date();
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
  const wLogs = state.logs.filter(l => new Date(l.date) >= weekAgo && parseFloat(l.pain) > 0);
  const maxPain = wLogs.length ? Math.max(...wLogs.map(l => parseFloat(l.pain))) : 0;
  const el = document.getElementById("pain-max-week");
  const lights = document.getElementById("traffic-lights");
  const label = document.getElementById("pain-trend-label");
  if (!el) return;
  el.textContent = maxPain || "0";
  el.style.color = maxPain >= 5 ? "var(--accent)" : maxPain >= 3 ? "var(--amber)" : "var(--green)";
  const zones = [
    { key: "itbs", label: "ITBS", loc: "itbs" },
    { key: "shin", label: "Shin", loc: "shin" },
    { key: "knee", label: "Knæ", loc: "patellar" }
  ];
  if (lights) {
    lights.innerHTML = zones.map(z => {
      const zl = wLogs.filter(l => l.painLocation?.includes(z.loc));
      const max = zl.length ? Math.max(...zl.map(l => parseFloat(l.pain))) : 0;
      const col = max >= 5 ? "red" : max >= 3 ? "amber" : "green";
      const adv = max >= 5 ? "Stop løb" : max >= 3 ? "Modificér" : "OK";
      return `<div class="tl-zone"><div class="tl-dot tl-${col}"></div><div class="tl-zone-label">${z.label}<br><span class="tl-advice">${adv}</span></div></div>`;
    }).join("");
  }
  if (label) {
    label.textContent = maxPain >= 5 ? "STOP — kun prehab + cykel" : maxPain >= 3 ? "Gul zone — reducer intensitet og distance" : maxPain > 0 ? "Grøn zone — monitorér, fortsæt planlagt" : "Ingen smerter logget denne uge";
    label.style.color = maxPain >= 5 ? "var(--accent)" : maxPain >= 3 ? "var(--amber)" : "var(--green)";
  }
}

function renderComplianceWeeksGrid() {
  const el = document.getElementById("compliance-weeks-grid");
  if (!el) return;
  const cur = getCurrentWeekNum();
  el.innerHTML = TRAINING_PLAN.map(week => {
    const w = week.num;
    const c = calcWeekCompliance(w);
    const isFuture = w > cur, isCurrent = w === cur;
    const pct = (c && !isFuture) ? c.pct : 0;
    const barColor = isFuture ? "var(--border)" : pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--accent)";
    return `<div class="cw-row ${isCurrent ? "cw-current" : ""}">
      <div class="cw-num">${String(w).padStart(2, "0")}</div>
      <div class="cw-title">${week.title}</div>
      <div class="cw-bar-outer"><div class="cw-bar-inner" style="width:${pct}%;background:${barColor}"></div></div>
      <div class="cw-pct" style="color:${isFuture ? "var(--text-muted)" : barColor}">${isFuture ? "—" : `${c?.done || 0}/${c?.planned || 0}`}</div>
    </div>`;
  }).join("");
}

function renderChartVolume() {
  destroyChart("volume");
  const canvas = document.getElementById("chart-volume");
  if (!canvas || typeof Chart === "undefined") return;
  const { labels, actual, planned } = getWeeklyVolumeData();
  chartRegistry["volume"] = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Gennemført (km)", data: actual, backgroundColor: "rgba(74,222,128,0.55)", borderColor: "#4ade80", borderWidth: 1, borderRadius: 4 },
        { label: "Planlagt (km)", data: planned, type: "line", borderColor: "rgba(96,165,250,0.8)", backgroundColor: "transparent", borderWidth: 2, borderDash: [4, 4], pointRadius: 3, tension: 0.3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { grid: { color: "rgba(42,42,54,0.8)" }, ticks: { maxRotation: 0 } },
        y: { grid: { color: "rgba(42,42,54,0.8)" }, beginAtZero: true, title: { display: true, text: "km" } }
      }
    }
  });
}

function renderChartInjury() {
  destroyChart("injury");
  const canvas = document.getElementById("chart-injury");
  if (!canvas || typeof Chart === "undefined") return;
  const { labels, itbs, shin, knee } = getInjuryTrendData();
  const bandPlugin = {
    id: "injuryBands",
    beforeDraw(chart) {
      const { ctx, chartArea: { top, left, right }, scales: { y } } = chart;
      if (!y) return;
      ctx.save();
      ctx.fillStyle = "rgba(251,191,36,0.07)";
      ctx.fillRect(left, y.getPixelForValue(5), right - left, y.getPixelForValue(3) - y.getPixelForValue(5));
      ctx.fillStyle = "rgba(255,91,62,0.07)";
      ctx.fillRect(left, top, right - left, y.getPixelForValue(5) - top);
      ctx.restore();
    }
  };
  chartRegistry["injury"] = new Chart(canvas, {
    type: "line", plugins: [bandPlugin],
    data: {
      labels,
      datasets: [
        { label: "ITBS", data: itbs, borderColor: "#ff5b3e", borderWidth: 2, tension: 0.3, fill: false, pointRadius: 5 },
        { label: "Shinsplints", data: shin, borderColor: "#fbbf24", borderWidth: 2, tension: 0.3, fill: false, pointRadius: 5 },
        { label: "Knæ", data: knee, borderColor: "#a78bfa", borderWidth: 2, tension: 0.3, fill: false, pointRadius: 5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { grid: { color: "rgba(42,42,54,0.8)" } },
        y: { grid: { color: "rgba(42,42,54,0.8)" }, beginAtZero: true, max: 10, title: { display: true, text: "NRS (0–10)" } }
      }
    }
  });
}

function renderChartACWR() {
  destroyChart("acwr");
  const canvas = document.getElementById("chart-acwr");
  if (!canvas || typeof Chart === "undefined") return;
  const { labels, data } = getACWRTrendData();
  const bandPlugin = {
    id: "acwrBand",
    beforeDraw(chart) {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      if (!y) return;
      ctx.save();
      ctx.fillStyle = "rgba(74,222,128,0.1)";
      ctx.fillRect(left, y.getPixelForValue(1.3), right - left, y.getPixelForValue(0.8) - y.getPixelForValue(1.3));
      ctx.restore();
    }
  };
  chartRegistry["acwr"] = new Chart(canvas, {
    type: "line", plugins: [bandPlugin],
    data: {
      labels,
      datasets: [
        {
          label: "ACWR",
          data,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96,165,250,0.12)",
          borderWidth: 2, tension: 0.3, fill: true, pointRadius: 6,
          pointBackgroundColor: data.map(v => v === null ? "transparent" : v > 1.5 ? "#ff5b3e" : v > 1.3 ? "#fbbf24" : v >= 0.8 ? "#4ade80" : "#60a5fa"),
          spanGaps: true
        },
        { label: "Risikegrænse (1.5)", data: labels.map(() => 1.5), borderColor: "rgba(255,91,62,0.4)", borderDash: [4, 4], borderWidth: 1, pointRadius: 0, fill: false },
        { label: "Sweet spot top (1.3)", data: labels.map(() => 1.3), borderColor: "rgba(74,222,128,0.4)", borderDash: [2, 4], borderWidth: 1, pointRadius: 0, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { grid: { color: "rgba(42,42,54,0.8)" } },
        y: { grid: { color: "rgba(42,42,54,0.8)" }, min: 0, max: 2.0, title: { display: true, text: "ACWR" } }
      }
    }
  });
}

function renderChartRpeHrv() {
  destroyChart("rpehrv");
  const canvas = document.getElementById("chart-rpe-hrv");
  if (!canvas || typeof Chart === "undefined") return;
  const { labels, rpeData, hrvData } = getRpeHrvData();
  chartRegistry["rpehrv"] = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "RPE (1–10)", data: rpeData, borderColor: "#ff5b3e", borderWidth: 2, tension: 0.3, fill: false, pointRadius: rpeData.map(v => v !== null ? 3 : 0), spanGaps: true, yAxisID: "y" },
        { label: "HRV (ms)", data: hrvData, borderColor: "#a78bfa", borderWidth: 2, tension: 0.3, fill: false, pointRadius: hrvData.map(v => v !== null ? 3 : 0), spanGaps: true, yAxisID: "y2" }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "top" } },
      scales: {
        x: { grid: { color: "rgba(42,42,54,0.8)" } },
        y: { grid: { color: "rgba(42,42,54,0.8)" }, position: "left", min: 1, max: 10, title: { display: true, text: "RPE", color: "#ff5b3e" } },
        y2: { grid: { drawOnChartArea: false }, position: "right", title: { display: true, text: "HRV ms", color: "#a78bfa" } }
      }
    }
  });
}

// ============================================================
// SETTINGS
// ============================================================
function setupSettings() {
  document.getElementById("set-age").value = state.profile.age || "";
  document.getElementById("set-weight").value = state.profile.weight || "";
  document.getElementById("set-5k").value = state.profile.prs["5k"];
  document.getElementById("set-10k").value = state.profile.prs["10k"];
  document.getElementById("set-hm").value = state.profile.prs.hm;
  document.getElementById("set-m").value = state.profile.prs.m;

  // Vis hvem der er logget ind
  const accountInfo = document.getElementById("account-info");
  if (accountInfo && currentUser) {
    accountInfo.textContent = `Logget ind som ${currentUser.email}`;
  }

  document.getElementById("settings-save").addEventListener("click", () => {
    state.profile.age = parseFloat(document.getElementById("set-age").value) || null;
    state.profile.weight = parseFloat(document.getElementById("set-weight").value) || null;
    state.profile.prs["5k"] = document.getElementById("set-5k").value;
    state.profile.prs["10k"] = document.getElementById("set-10k").value;
    state.profile.prs.hm = document.getElementById("set-hm").value;
    state.profile.prs.m = document.getElementById("set-m").value;
    saveProfile();
    sbSaveProfile(); // sync til Supabase
    flash("Profil gemt");
    renderDashboard();
    renderZones();
  });

  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    if (confirm("Log ud? Dine data er gemt i skyen.")) {
      await sb.auth.signOut();
      flash("Logget ud");
    }
  });

  document.getElementById("export-data").addEventListener("click", () => {
    const data = {
      profile: state.profile, logs: state.logs, ai: { ...state.ai, key: "" }, completed: state.completed
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sub128-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("import-data").addEventListener("click", () => {
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.profile) { state.profile = { ...RUNNER_DEFAULTS, ...data.profile }; saveProfile(); }
        if (data.logs) { state.logs = data.logs; saveLogs(); }
        if (data.completed) { state.completed = data.completed; saveCompleted(); }
        flash("Data importeret");
        renderAll();
      } catch (err) {
        flash("Fejl ved import: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("reset-data").addEventListener("click", () => {
    if (confirm("Slet ALLE logs? Denne handling kan ikke fortrydes.")) {
      state.logs = [];
      state.completed = {};
      saveLogs();
      saveCompleted();
      renderLogger();
      flash("Logs nulstillet");
    }
  });
}

// ============================================================
// ZONE RECALC
// ============================================================
function setupZoneRecalc() {
  document.getElementById("in-thr-pace").value = state.profile.thresholdPace;
  document.getElementById("in-lthr").value = state.profile.lthr;
  document.getElementById("in-mhr").value = state.profile.maxHr;
  document.getElementById("in-rhr").value = state.profile.restingHr;

  document.getElementById("zone-recalc").addEventListener("click", () => {
    state.profile.thresholdPace = document.getElementById("in-thr-pace").value;
    state.profile.lthr = parseInt(document.getElementById("in-lthr").value);
    state.profile.maxHr = parseInt(document.getElementById("in-mhr").value);
    state.profile.restingHr = parseInt(document.getElementById("in-rhr").value);
    saveProfile();
    sbSaveProfile(); // sync til Supabase
    renderZones();
    renderDashboard();
    flash("Zoner genberegnet");
  });
}

// ============================================================
// NAV / TABS
// ============================================================
function switchTab(target) {
  // Top tabs
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab[data-tab="${target}"]`)?.classList.add("active");
  // Views
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(`view-${target}`)?.classList.add("active");
  // Mobile nav sync
  document.querySelectorAll(".mnav-item[data-tab]").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === target));
  // Scroll top (except plan — it scrolls to current week instead)
  if (target !== "plan") window.scrollTo({ top: 0, behavior: "smooth" });
  // Lazy renders
  if (target === "progress") renderProgress();
  if (target === "plan") {
    setTimeout(() => {
      const openCard = document.querySelector("#plan-weeks .week-card.open");
      openCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

// ============================================================
// MOBIL BOTTOM NAVIGATION
// ============================================================
function setupMobileNav() {
  // Primary nav items
  document.querySelectorAll(".mnav-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // More button → open sheet
  document.getElementById("mnav-more")?.addEventListener("click", () => {
    document.getElementById("more-sheet")?.classList.add("open");
    document.getElementById("more-backdrop")?.classList.add("visible");
  });

  const closeSheet = () => {
    document.getElementById("more-sheet")?.classList.remove("open");
    document.getElementById("more-backdrop")?.classList.remove("visible");
  };

  document.getElementById("more-backdrop")?.addEventListener("click", closeSheet);

  document.querySelectorAll(".more-sheet-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
      closeSheet();
    });
  });
}

// ============================================================
// FLASH NOTIFICATION
// ============================================================
function flash(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: var(--accent); color: #0a0a0c; padding: 10px 16px;
    border-radius: 8px; font-family: var(--font-display); font-weight: 600;
    letter-spacing: 0.06em; font-size: 13px; z-index: 10000;
    box-shadow: 0 4px 20px var(--accent-glow);
    animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

// ============================================================
// INIT
// ============================================================
function renderAll() {
  renderDashboard();
  renderPlan();
  renderLogger();
  renderZones();
  renderPrehab();
  // Progress renderes lazy ved tab-klik for at undgå canvas-problemer
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupMobileNav();
  setupLogForm();
  setupZoneRecalc();
  setupAi();
  setupSettings();
  setupAuth();
  setupSyncTriggers();
  registerServiceWorker();
});

// PWA: service worker gør appen installérbar og hurtig/offline-venlig
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  // SW kræver https eller localhost — springes over ved file://
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
  navigator.serviceWorker.register("sw.js").catch((err) => console.warn("SW-registrering fejlede:", err));
}

// Auto-sync + klikbar sync-dot
function setupSyncTriggers() {
  // 1. Sync når browser-tabben bliver aktiv igen (skift fra mobil → computer)
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && currentUser) {
      await flushSyncQueue(); // push evt. ventende offline-writes først
      await loadFromSupabase();
      renderAll();
    }
  });

  // 2. Klik på sync-dot for manuel pull
  const dot = document.getElementById("sync-dot");
  if (dot) {
    dot.style.cursor = "pointer";
    dot.title = "Klik for at synkronisere nu";
    dot.addEventListener("click", async () => {
      if (!currentUser) { flash("Log ind for at synkronisere"); return; }
      await loadFromSupabase();
      renderAll();
      flash("Data synkroniseret ✓");
    });
  }
}
