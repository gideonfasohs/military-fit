# MILITARY FIT — Design guide ("Night Ops v2", approved)

Feel: bold and military, but warm and welcoming. Dark navy, gold accents, rounded cards, an icon tile on every row, big ring charts, line charts with a soft fill, roomy spacing. Mobile-first (design at 390px wide).

## Colours (CSS variables in css/app.css)
```css
:root{
  --bg:#081120;        /* page background */
  --card:#111F35;      /* cards, list rows, inputs */
  --card-2:#172A47;    /* raised items, avatar/emblem fill */
  --nav:#0C182B;       /* bottom navigation */
  --line:#1E3253;      /* dividers, ring/progress track */
  --line-2:#3A5174;    /* outline buttons, empty checkboxes */
  --gold:#F2C14E;      /* main accent: buttons, rings, chart lines, active nav */
  --gold-tint:#2B2A1E; /* background of icon tiles, tip cards, streak card */
  --gold-text:#E8E1C4; /* body text on gold-tint cards */
  --text:#EEF2F8;      /* main text */
  --muted:#93A3BC;     /* labels, secondary text */
  --ok:#4ADE80; --ok-bg:#10291C; --ok-text:#7BE3A1;   /* ONLY for "Camera verified" / "Camera active" */
  --danger-bg:#2A1218; --danger-line:#8A2E35; --danger-text:#FF9AA0;
  --water:#4C9BE8;
}
```
Rules: gold is the only accent. Green means camera verification only. Text on gold is `--bg`. Keep text contrast at least 4.5:1.

## Fonts (save the files in the repo, no CDN, so the app works offline)
- Headings and numbers: **Barlow Condensed** 600/700, mixed case (not all caps). Examples: page title 30px; greeting 34px; card title 20–22px; big numbers 28–46px; rep counter 44–80px.
- Body: **Inter** 400/500/600/700, 13–15px; labels 11–12px.

## Shapes and spacing
- Card radius 18–22px, list rows 16px, icon tiles 10px, pill buttons fully rounded.
- Screen padding 18px; gap between cards 12–14px.
- Touch targets at least 44px (main buttons 54–58px tall).

## Components
- **Primary button:** gold background, `--bg` text, Barlow Condensed 21–24px bold, pill shape, optional arrow or play icon.
- **Outline button:** transparent, 1.5px `--line-2` border, white text.
- **Icon tile:** 32–36px rounded square, `--gold-tint` background, gold stroke icon (2px line icons, inline SVG, no emoji).
- **Selectable row** (onboarding):
  - Card background with an icon tile, label and a round 24px check on the right.
  - When selected: 1.5px gold border, and the check fills gold with a dark tick.
- **Stat tile:** card with the icon tile on top, a big number, and a small muted label.
- **Ring chart:** SVG with a `--line` track, a gold progress stroke (round cap) and the centre value in Barlow Condensed.
- **Line chart:**
  - Gold 3px line with hollow dots (dark fill, gold stroke).
  - Area fill below: a gold gradient going from 32% opacity to 0.
  - Faint `--line` gridlines.
- **Tip card:** `--gold-tint` background, bulb icon, gold title, `--gold-text` body.
- **Segmented tabs:** card background; the active tab is a gold pill.
- **Bottom nav:** height 70px, `--nav` background, top border `#1A2B45`, 5 items (icon + 11px label). The active item is gold and bold.
- **Camera badge:** pill in the `--ok` colours, with "Camera active · on this phone only" or "Camera verified".
- **Self-reported badge:** muted pill reading "Self-reported". It never uses the green colours.
- **Emblem:** a shield outline with two chevrons and a star, all in gold. It appears on Welcome, and small in the dashboard header.

## Screens (see design-reference/)
1. Welcome:
   - Large emblem in a gold ring.
   - "MILITARY" with "FIT" in gold below it, and the tagline "Train. Track. Transform."
   - "Get Started" button.
2. Onboarding question:
   - Step dots at the top.
   - Big question and helper line.
   - Selectable rows with icons, then a "Next" button.
3. Dashboard:
   - Logo and reminders button.
   - Greeting.
   - Weekly ring card next to a Day X/30 card and a gold streak card.
   - "Start Today's Workout".
   - 3 stat tiles (weight, waist, active time).
   - Progress line chart card.
   - "Next workout" row.
4. Exercise demo:
   - Animation card (animated figure on a soft circle, with a "1 / 5" badge, play button, 0.5× and full screen).
   - Exercise name, then sets · reps · rest.
   - Reps and active-time tiles.
   - "Get ready" bar, then Pause / "Start with camera".
5. Camera workout:
   - Camera feed with gold tracking points.
   - "Rep counted!" gold card.
   - Active/rest tiles and set progress bar.
   - Red stop-camera button at the top right.
6. Progress: tabs (Weekly / Monthly / 3 Months), weight chart card, waist chart card, completion ring card.
7. Nutrition:
   - Meal rows with a small plate illustration and a check circle.
   - Water card with a blue bar and a "+250" button.
   - Tip card that says portions are estimates.
8. Coach: chat bubbles (coach on the left in card colour, user on the right in gold), tip bubble, quick-reply chips, input bar.
9. Weekly report: big ring, list of changes with check icons, achievement card, "View details".
10. Settings: profile card, list of rows with icon tiles and chevrons, and a "Delete all my data" button styled as a danger button.

## Honesty in the UI
- Never show sample numbers in the real app. With no data, show an empty state: "No entries yet — log your first weight".
- Features not built yet show a muted "Coming in Phase N" card in the same style, never a fake value.
