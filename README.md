# SUB 1:28 — CPH Half 2026

Personal training platform til at ramme sub 1:28 på Copenhagen Half Marathon søndag 20. september 2026.

Bygget specifikt til dig:
- Dine Coros-data er forhåndsudfyldt (LTHR 174, threshold 4:28, alle PRs)
- 17-ugers periodiseret plan justeret til IT-bånd, knæ og shinsplints
- Prehab-modul med interaktiv body map og animerede øvelser
- AI Coach via Gemini (gratis tier)
- Alt kører lokalt i din browser — ingen backend, ingen tracking

## Sådan kører du den lokalt (5 sekunder)

Dobbelt-klik på `index.html`. Færdig.

Hvis du vil have en lokal server (anbefales for at undgå CORS-quirks med Gemini):
```bash
cd cph-sub128
python3 -m http.server 8000
# Åbn http://localhost:8000
```

## Sådan deployer du til GitHub Pages (gratis hosting)

1. Opret nyt repo på GitHub, fx `cph-sub128` (kan være privat)
2. Pak alle 6 filer op i repo-roden:
   ```
   index.html
   styles.css
   data.js
   plan.js
   exercises.js
   app.js
   README.md
   ```
3. Push:
   ```bash
   git init
   git add .
   git commit -m "Initial sub 1:28 platform"
   git branch -M main
   git remote add origin https://github.com/DIT-BRUGERNAVN/cph-sub128.git
   git push -u origin main
   ```
4. På GitHub: **Settings → Pages → Source: Deploy from branch → Branch: main / (root)** → Save
5. Vent 1-2 min. Din side er nu på `https://DIT-BRUGERNAVN.github.io/cph-sub128/`

Gem URL'en på din telefons hjemmeskærm — så fungerer den som en native app.

## Filer

| Fil | Hvad |
|---|---|
| `index.html` | Struktur og layout for alle 6 views |
| `styles.css` | Design system (dark mode, Antonio + Geist fonts, coral accent) |
| `data.js` | Din runner-profil og fase-definitioner — **rediger her hvis Coros data ændrer sig** |
| `plan.js` | Hele 17-ugers planen + styrkeprogrammer |
| `exercises.js` | Body map data + alle prehab-øvelser + SVG-animationer |
| `app.js` | Logikken — state, navigation, AI-integration, rendering |

## Gemini AI Coach setup

1. Gå til [aistudio.google.com/apikey](https://aistudio.google.com/apikey) og opret en gratis API-key (login med Google)
2. I appen: **AI Coach** tabben → indsæt key → Gem → Test forbindelse
3. Spørg løs. Coachen har adgang til din plan + dine logs + dine skader som kontekst.

Gratis tier på Gemini er rigeligt til personlig brug. Din key gemmes kun i din browsers `localStorage` (sendes aldrig nogen steder andet end direkte til Google).

## Data backup

Alt data lever lokalt i din browser. **Eksporter regelmæssigt** under Indstillinger → Eksporter JSON. Hvis du skifter browser/computer/sletter cookies, er dine logs væk uden backup.

## Hvis Strava-integration skal med senere

Strava OAuth kræver:
1. Opret app på developers.strava.com → få Client ID + Secret
2. OAuth-flow til at få access token (kræver en simpel callback-side)
3. Hent activities via `/api/v3/athlete/activities`

Det er en udvidelse — sig til hvis du vil have det bygget oven på. For nu får du mere ud af manuel logging fordi du tvinges til at notere smerter, RPE og noter (som Strava ikke fanger automatisk).

## Justér planen

Planen er i `plan.js` som en simpel JavaScript-array. Hver uge er et objekt med workouts. Du kan:
- Bytte træningsdage rundt (skift `day: "tue"` til `day: "wed"`)
- Justere pacing-mål (alt er i kommentarer)
- Tilføje race-week pas hvis du finder et tune-up race

Alternativt: brug AI Coach til at justere on-the-fly, og opdater så `plan.js` når en justering bliver permanent.

## De vigtigste numre

| | Værdi |
|---|---|
| Race | Søndag 20. sep 2026, start 09:47 |
| Mål-tid | 1:28:00 |
| Race pace | 4:10 /km |
| Threshold pace (start) | 4:28 /km |
| Threshold pace mål (peak) | 4:15 /km |
| LTHR | 174 bpm |
| Race day pacing | Negativt split: 4:12 → 4:10 → 4:05 |

## Hvad den IKKE gør (med vilje)

- Ingen automatic Strava sync (du lærer mere af manuel logging)
- Ingen sociale features (det handler om dig)
- Ingen notifikationer/badges (du skal kigge på den fordi du vil, ikke fordi den nudger)
- Ingen tracking/analytics (det er din private træningsdata)
