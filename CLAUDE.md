# MILITARY FIT — project guide for Claude Code

Full requirements: `MILITARY_FIT_SPEC.md` (the master prompt). Read it before any new phase.
This file records the decisions already made. Follow them unless Gideon changes them.

## Who you are working with
- Gideon (Moshi, Tanzania). He is NOT a coder. Explain what you are doing in simple, short English, as if to a beginner.
- Start replies with the most important point or risk, not agreement. Tag claims [Certain], [Likely] or [Guessing].
- Before changing existing code, read it and confirm how it works. Ask when something is unclear; do not invent logic.
- Make small, surgical changes. Never break or rewrite working features you were not asked to touch.
- No placeholders, fake buttons, fake data or fake "camera verified" labels. If something isn't built yet, label it "Coming in Phase N".
- After each task, tell him in 2–4 lines what changed and how to test it on his phone.

## Decisions already made
- **App type:** Progressive Web App (PWA). Installed from Chrome on Android with "Add to Home screen". Works offline.
- **Code:** plain HTML, CSS and JavaScript (ES modules). No frameworks, no build step, no CDN links. Everything must work offline.
- **Hosting:** GitHub Pages (free HTTPS, which the camera needs). The app lives under a sub-path (`/<repo-name>/`), so use **relative paths only** (`./js/app.js`, not `/js/app.js`). The manifest uses `start_url: "./"` and `scope: "./"`.
- **Data storage:** IndexedDB on the phone. Call `navigator.storage.persist()`. No server in Phases 1–4.
  - Store metric values internally (kg, cm) and convert for display.
  - A missing value is `null`, never `0`.
  - Settings must have **Export backup** (JSON file), **Import backup** and **Delete all my data**.
- **Later (not now):** cPanel/PHP or a similar backend for multi-user accounts, sync and push reminders. Don't add it until Gideon asks.
- **Exercise animations — Option A (chosen):** animated figures drawn in code on `<canvas>`, using forward kinematics:
  - Each pose is a set of joint angles (torso, head, upper arm, forearm, thigh, shin, for near and far limbs).
  - Keyframes are eased between, and the figure is kept on the ground.
  - Each keyframe can name a "planted" joint (foot, hand or knee) so it doesn't slide.
  - Side view by default; front view for jumping jacks and step jacks.
  - Controls: play, pause, replay, slow motion (0.5×), loop on/off and full screen.
  - Check every animation visually. If it looks wrong, fix the angles.
- **Charts:** draw them as simple SVG with your own code (no chart library).
- **Camera (Phase 3):** MediaPipe Pose Landmarker (web version), with the model files saved in the repo so it works offline. Processing happens on the phone only, and video is never stored or uploaded. Build squats, jumping jacks, plank and push-ups (side view) first.
- **Known PWA limits (tell the user honestly when relevant):**
  - Steps can't be counted in the background.
  - Exact-time reminders need a server.
  - Camera tracking stops when the screen locks.

## Design (APPROVED — "Night Ops v2", Delight Niche navy + gold)
Follow `DESIGN.md` exactly; it replaces the olive colours in the spec. The approved mockups are in `design-reference/` (open them for layout; they use a template syntax `{{ }}`, `<sc-for>`, `<sc-if>` — copy the look, not that syntax).
Bottom navigation: Home, Workouts, Library, Progress, More. Nutrition, Coach and Settings sit under More.

## Folder layout
```
index.html  manifest.webmanifest  sw.js  icons/
css/app.css
js/app.js (router)   js/db.js (IndexedDB)   js/units.js   js/dates.js
js/anim.js (figure engine)   js/data/exercises.js   js/data/questions.js
js/programme.js (generator + schedule logic)
js/views/ (onboarding, profile, dashboard, workouts, day, library, exercise, progress, more, settings)
```
Use hash routing (`#/dashboard`, `#/day/12`, `#/ex/squat` …). If no profile exists, open onboarding.
Bump the service worker's cache name every time files change.

## Phase 1 scope (build this first)
1. **Onboarding:** one question at a time, with Back, a progress bar and resume-if-closed. Questions 1–10 from the spec:
   - If more than one goal is chosen in Q1, ask which one is the most important.
   - Q10 uses checkboxes (knees, lower back, shoulders, wrists, ankles/feet, heart/blood pressure/breathing, other text, no known limitations).
   - Then collect profile info: name, age, height and weight required; the rest optional; units choice.
   - Then optional targets (weight, waist, push-ups, plank seconds, walking minutes).
2. **Baseline (all optional, "only what is comfortable"):** push-up variation and reps, squat reps, plank seconds, comfortable walking minutes, energy 1–5. Progress photos say "Coming in Phase 4".
3. **My Fitness Profile summary:**
   - A table of goal → how it is measured → starting value → target.
   - Ask "Does this accurately describe what you want to achieve?" with an edit button for each section.
4. **Programme generator (rule-based, explain every choice in a "Why this programme" list):**
   - Weekly pattern comes from days/week (Q8). The 5-day pattern is the spec's default 30-day programme (strength, conditioning, core, active recovery, circuit, endurance + core, rest).
   - Goal changes the emphasis:
     - Fat loss: longer walks and conditioning.
     - Strength/muscle: second strength day and 3 sets.
     - Endurance: extra conditioning and longer walks.
     - Mobility: a mobility session.
     - Military prep: extra push-up work.
   - Level (and baseline) sets the push-up variation (wall → knee → standard), the sets and reps scale, and the plank time.
   - Time available (Q7) trims or adds exercises and sets.
   - Limitations swap exercises:
     - Knees: no lunges, jumping or burpees.
     - Back: dead bugs instead of crunches.
     - Wrists/shoulders: wall push-ups and standing mountain climbers.
     - Heart/breathing: lower intensity, plus advice to get medical clearance.
   - Weekly progression: week 2 +2 reps, week 3 +1 set (max 3) and +5s plank, week 4 +2 reps.
   - Show the programme for review, then **Accept & start**.
5. **30-day schedule logic:**
   - The day number comes from the start date, an offset and pauses.
   - Controls: pause/resume, skip, "do it tomorrow", "repeat a missed day today", reduce/increase difficulty, change an exercise variation, adjust sets/reps, restart.
   - Manual "Mark as done" stores actual sets/reps labelled **self-reported**, kept separate from the prescription.
6. **Dashboard:**
   - Shows today's session (training, active recovery or rest), day/week, Start button, weekly ring, 30-day bar, streak, workouts done, latest weight/waist and next workout.
   - Achievements are based on real records only.
   - Active time and water show "Not tracked yet (Phase 2/4)".
7. **Exercise library:** all 24 exercises from the spec. Each has an animation plus the 10 fields: name, start position, steps, breathing, sets/reps, muscles, mistakes, beginner version, safety, and camera support planned or not.
8. **Settings:** edit answers (creates a new programme recommendation), units, backup export/import, delete data, install help.
9. **PWA:**
   - Manifest, icons (192, 512, maskable) and a service worker that caches the app shell (cache-first).
   - Only register the service worker on https or localhost.

Phases 2–5 follow the spec, in order. Finish and test each phase before starting the next one.

## Testing
- The PC runs Linux. The project folder is `/home/delight/Documents/FITNESS APP` (it has a space, so always quote the path in commands).
- On the PC: run `python3 -m http.server 8000` in the project folder and open `http://localhost:8000` in Chrome. Use DevTools device mode (a phone size) and check the Console for errors.
- On the phone: push to GitHub, wait about 1 minute for Pages, then open the link in Chrome.
- Before saying a phase is done:
  - Click through every screen.
  - Reload and confirm the data is still there.
  - Test offline mode (DevTools → Network → Offline).
  - Confirm no console errors.

## Git
Use small commits with clear messages, and push only when Gideon says to (or at the end of a finished, tested task he asked for).
