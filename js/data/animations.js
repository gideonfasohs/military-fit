// Pose data for all 24 exercise figures. Angles: 0 = up, 90 = forward, 180 = down, 270 = back.
// See the comment at the top of js/anim.js. Side view faces right; front view: N = screen right.
//
// RULES FOR AUTHORS (so feet and hands never slide):
//  - `plant` names a point that stays fixed on the floor: 'ankleN', 'toeN', 'kneeN', 'handN' (or the F versions).
//  - The planted point must be on the floor in BOTH keyframes where it is used.
//  - Only switch `plant` on a keyframe where BOTH points are on the floor (for example a "stand" pose).
//  - `touch` / `touchAny` are for the check tool (tools/check.mjs): they list points that must sit on the floor.
//  - `scrollDist` = how far the floor slides backwards in one loop (walking in place).

const P = (base, o) => ({ ...base, ...o });
const ARMS_DOWN = { uArm: 178, fArm: 172 };

// =====================================================================
// UPPER BODY
// =====================================================================

// ---- Wall push-up (side view). Hands stay on the wall, feet stay flat on the floor. ----
// Angles worked out so that the hand never moves on the wall (hand height 0.73, wall at x = 0.595).
const WP = a => ({ torso: a, head: a - 6, thigh: a + 180, shin: a + 180, ft: 90 });
const WP_TOP = P(WP(22), { uArm: 90, fArm: 90 });
const WP_MID = P(WP(25.5), { uArm: 114, fArm: 53.7 });
const WP_LOW = P(WP(29), { uArm: 118.9, fArm: 34.3 });

export const wallPushup = {
  id: 'wall-pushup', name: 'Wall push-up', view: 'side', duration: 4200, prop: 'wall',
  touch: ['ankleN', 'toeN'],
  keyframes: [
    { t: 0, pose: WP_TOP, plant: 'handN', cue: 'Arms straight, hands on the wall at shoulder height' },
    { t: 850, pose: WP_MID, plant: 'handN', ease: 'in', cue: 'Bend your elbows, bring your chest to the wall' },
    { t: 1700, pose: WP_LOW, plant: 'handN', ease: 'out', cue: 'Bend your elbows, bring your chest to the wall' },
    { t: 2100, pose: WP_LOW, plant: 'handN', cue: 'Pause close to the wall' },
    { t: 2900, pose: WP_MID, plant: 'handN', ease: 'in', cue: 'Push away until your arms are straight' },
    { t: 3700, pose: WP_TOP, plant: 'handN', ease: 'out', cue: 'Push away until your arms are straight' },
    { t: 4200, pose: WP_TOP, plant: 'handN', cue: 'Reset' },
  ],
};

// ---- Knee push-up (side view). Hands and knees on the floor. ----
const KP_UP = { torso: 54, head: 58, uArm: 180, fArm: 180, thigh: 234, shin: 282, ft: 282 };
const KP_MID = { torso: 61.5, head: 65.5, uArm: 221, fArm: 150, thigh: 241.5, shin: 282, ft: 282 };
const KP_DOWN = { torso: 77.25, head: 81.25, uArm: 270, fArm: 146, thigh: 257.25, shin: 282, ft: 282 };

export const kneePushup = {
  id: 'knee-pushup', name: 'Knee push-up', view: 'side', duration: 4200,
  touch: ['handN', 'kneeN'],
  keyframes: [
    { t: 0, pose: KP_UP, plant: 'handN', cue: 'Knees down, straight line from head to knees' },
    { t: 850, pose: KP_MID, plant: 'handN', ease: 'in', cue: 'Lower your chest, elbows tucked in' },
    { t: 1700, pose: KP_DOWN, plant: 'handN', ease: 'out', cue: 'Lower your chest, elbows tucked in' },
    { t: 2100, pose: KP_DOWN, plant: 'handN', cue: 'Chest just above the floor' },
    { t: 2900, pose: KP_MID, plant: 'handN', ease: 'in', cue: 'Press up, keep your body in one line' },
    { t: 3700, pose: KP_UP, plant: 'handN', ease: 'out', cue: 'Press up, keep your body in one line' },
    { t: 4200, pose: KP_UP, plant: 'handN', cue: 'Reset' },
  ],
};

// ---- Standard push-up (side view) ----
const PU_UP = { torso: 71.5, head: 75.5, uArm: 180, fArm: 180, thigh: 251.5, shin: 251.5, ft: 150 };
const PU_MID = { torso: 75.5, head: 79.5, uArm: 225, fArm: 165, thigh: 255.5, shin: 255.5, ft: 150 };
const PU_DOWN = { torso: 84, head: 88, uArm: 262, fArm: 150, thigh: 264, shin: 264, ft: 150 };

export const pushup = {
  id: 'pushup', name: 'Push-up', view: 'side', duration: 4200,
  touch: ['handN', 'toeN'],
  keyframes: [
    { t: 0, pose: PU_UP, plant: 'handN', cue: 'Straight body, hands under shoulders' },
    { t: 850, pose: PU_MID, plant: 'handN', ease: 'in', cue: 'Lower your chest, elbows tucked in' },
    { t: 1700, pose: PU_DOWN, plant: 'handN', ease: 'out', cue: 'Lower your chest, elbows tucked in' },
    { t: 2100, pose: PU_DOWN, plant: 'handN', cue: 'Chest just above the floor' },
    { t: 2900, pose: PU_MID, plant: 'handN', ease: 'in', cue: 'Press up, keep your body in one line' },
    { t: 3700, pose: PU_UP, plant: 'handN', ease: 'out', cue: 'Press up, keep your body in one line' },
    { t: 4200, pose: PU_UP, plant: 'handN', cue: 'Reset' },
  ],
};

// =====================================================================
// LOWER BODY
// =====================================================================

// ---- Bodyweight squat (side view) ----
const SQ_STAND = { torso: 0, head: 0, uArm: 178, fArm: 175, thigh: 180, shin: 180, ft: 90 };
const SQ_DOWN = { torso: 38, head: 18, uArm: 92, fArm: 88, thigh: 100, shin: 213, ft: 90 };

export const squat = {
  id: 'squat', name: 'Bodyweight squat', view: 'side', duration: 4200,
  touch: ['ankleN', 'toeN'],
  keyframes: [
    { t: 0, pose: SQ_STAND, plant: 'ankleN', cue: 'Stand tall, feet shoulder-width apart' },
    { t: 1600, pose: SQ_DOWN, plant: 'ankleN', cue: 'Sit hips back and down, chest up' },
    { t: 2100, pose: SQ_DOWN, plant: 'ankleN', cue: 'Pause at the bottom' },
    { t: 3700, pose: SQ_STAND, plant: 'ankleN', cue: 'Push through your heels and stand tall' },
    { t: 4200, pose: SQ_STAND, plant: 'ankleN', cue: 'Reset' },
  ],
};

// ---- Reverse lunge (side view). The far leg stays in front, the near leg steps back. ----
// A middle pose lifts the back foot so it swings back through the air instead of dragging.
const RL_STAND = { torso: 0, head: 0, ...ARMS_DOWN, thigh: 180, shin: 180, ft: 90 };
const RL_LIFT = {                           // back foot just left the floor
  torso: 2, head: 1, uArm: 177, fArm: 171,
  thigh: 183, shin: 225, ft: -110,           // -110 = 250: toe swings UP, not down, so it never digs into the floor
  thighF: 165, shinF: 181, ftF: 90,
};
const RL_MID = {
  torso: 3, head: 2, uArm: 176, fArm: 170,
  thigh: 188, shin: 245, ft: 120,
  thighF: 137.5, shinF: 182.5, ftF: 90,
};
const RL_DOWN = {
  torso: 6, head: 4, uArm: 176, fArm: 168,
  thigh: 200, shin: 285, ft: 150,          // back leg (near): knee just above the floor, heel up
  thighF: 95, shinF: 185, ftF: 90,         // front leg (far): knee over ankle
};

export const reverseLunge = {
  id: 'reverse-lunge', name: 'Reverse lunge', view: 'side', duration: 4800,
  touch: ['ankleF'],
  keyframes: [
    { t: 0, pose: RL_STAND, plant: 'ankleF', cue: 'Stand tall, feet together' },
    { t: 250, pose: RL_LIFT, plant: 'ankleF', ease: 'linear', cue: 'Step one foot back and lower your back knee' },
    { t: 800, pose: RL_MID, plant: 'ankleF', ease: 'sine', cue: 'Step one foot back and lower your back knee' },
    { t: 1500, pose: RL_DOWN, plant: 'ankleF', ease: 'out', cue: 'Step one foot back and lower your back knee' },
    { t: 2100, pose: RL_DOWN, plant: 'ankleF', cue: 'Front knee stays over your ankle' },
    { t: 2800, pose: RL_MID, plant: 'ankleF', ease: 'in', cue: 'Push through the front foot and step back in' },
    { t: 3350, pose: RL_LIFT, plant: 'ankleF', ease: 'sine', cue: 'Push through the front foot and step back in' },
    { t: 3600, pose: RL_STAND, plant: 'ankleF', ease: 'out', cue: 'Push through the front foot and step back in' },
    { t: 4800, pose: RL_STAND, plant: 'ankleF', cue: 'Reset, then switch legs' },
  ],
};

// ---- Glute bridge (side view, lying on the back, head to the right) ----
// Shoulders and feet stay in place; angles solved so both stay on the floor.
const GB_LOW = {
  torso: 90, head: 70, uArm: 270, fArm: 270,
  thigh: 322.5, shin: 206.4, ft: 270,
};
const GB_TOP = {
  torso: 110, head: 63, uArm: 270, fArm: 270,
  thigh: 299.3, shin: 194.3, ft: 270,
};

export const gluteBridge = {
  id: 'glute-bridge', name: 'Glute bridge', view: 'side', duration: 4600,
  touch: ['ankleN', 'toeN', 'shoulderN'],
  keyframes: [
    { t: 0, pose: GB_LOW, plant: 'ankleN', cue: 'Lie on your back, knees bent, feet flat' },
    { t: 1500, pose: GB_TOP, plant: 'ankleN', cue: 'Squeeze your bottom and lift your hips' },
    { t: 2300, pose: GB_TOP, plant: 'ankleN', cue: 'Hold for a moment' },
    { t: 3900, pose: GB_LOW, plant: 'ankleN', cue: 'Lower your hips slowly' },
    { t: 4600, pose: GB_LOW, plant: 'ankleN', cue: 'Reset' },
  ],
};

// =====================================================================
// CORE
// =====================================================================

// ---- Plank (forearm plank, side view). A hold, so only a tiny breathing movement. ----
const PL_A = { torso: 82.5, head: 86, uArm: 180, fArm: 90, thigh: 262.5, shin: 262.5, ft: 150 };
const PL_B = { torso: 82.5, head: 90, uArm: 180, fArm: 90, thigh: 262.5, shin: 262.5, ft: 150 };

export const plank = {
  id: 'plank', name: 'Plank', view: 'side', duration: 4000,
  touch: ['handN', 'toeN'],
  keyframes: [
    { t: 0, pose: PL_A, plant: 'handN', cue: 'Elbows under shoulders, body in one straight line' },
    { t: 2000, pose: PL_B, plant: 'handN', ease: 'sine', cue: 'Hold still. Tummy and bottom tight. Keep breathing' },
    { t: 4000, pose: PL_A, plant: 'handN', ease: 'sine', cue: 'Hold still. Tummy and bottom tight. Keep breathing' },
  ],
};

// ---- Crunch (side view, lying on the back) ----
const CR_DOWN = {
  torso: 90, head: 70, uArm: 40, fArm: 190,
  thigh: 322.5, shin: 206.4, ft: 270,
};
const CR_UP = {
  torso: 58, head: 42, uArm: 8, fArm: 158,
  thigh: 322.5, shin: 206.4, ft: 270,
};

export const crunch = {
  id: 'crunch', name: 'Crunch', view: 'side', duration: 4000,
  touch: ['ankleN', 'toeN'],
  keyframes: [
    { t: 0, pose: CR_DOWN, plant: 'ankleN', cue: 'Knees bent, hands lightly behind your head' },
    { t: 1300, pose: CR_UP, plant: 'ankleN', cue: 'Tighten your tummy and curl your shoulders up' },
    { t: 1700, pose: CR_UP, plant: 'ankleN', cue: 'Pause at the top' },
    { t: 3000, pose: CR_DOWN, plant: 'ankleN', cue: 'Lower slowly, with control' },
    { t: 4000, pose: CR_DOWN, plant: 'ankleN', cue: 'Reset' },
  ],
};

// ---- Lying knee raise (side view). Knees come up towards the chest. ----
const LK_DOWN = { torso: 90, head: 70, uArm: 270, fArm: 270, thigh: -37.5, shin: 206.4, ft: 270 };   // -37.5 = 322.5; keep angles continuous
const LK_UP = { torso: 90, head: 70, uArm: 270, fArm: 270, thigh: 15, shin: 255, ft: 240 };

export const lyingKneeRaise = {
  id: 'lying-knee-raise', name: 'Lying knee raise', view: 'side', duration: 4200,
  keyframes: [
    { t: 0, pose: LK_DOWN, cue: 'Lie on your back, knees bent, feet on the floor' },
    { t: 1500, pose: LK_UP, cue: 'Bring your knees up towards your chest' },
    { t: 2000, pose: LK_UP, cue: 'Pause, tummy tight' },
    { t: 3500, pose: LK_DOWN, cue: 'Lower your feet back to the floor slowly' },
    { t: 4200, pose: LK_DOWN, cue: 'Reset' },
  ],
};

// ---- Dead bug (side view). Opposite arm and leg reach away, back stays flat. ----
const DB_BASE = { torso: 90, head: 70, uArm: 0, fArm: 0, thigh: 0, shin: 270, ft: 220 };
const DB_A = P(DB_BASE, {                     // near arm overhead + far leg out
  uArm: 90, fArm: 90, uArmF: 0, fArmF: 0,
  thighF: -92, shinF: 268, ftF: 268,
});
const DB_B = P(DB_BASE, {                     // far arm overhead + near leg out
  uArm: 0, fArm: 0, uArmF: 90, fArmF: 90,
  thigh: -92, shin: 268, ft: 268, thighF: 0, shinF: 270, ftF: 220,
});

export const deadBug = {
  id: 'dead-bug', name: 'Dead bug', view: 'side', duration: 6000,
  keyframes: [
    { t: 0, pose: DB_BASE, cue: 'Arms up, knees bent over your hips, back flat' },
    { t: 1100, pose: DB_A, cue: 'Lower one arm and the opposite leg' },
    { t: 1500, pose: DB_A, cue: 'Keep your lower back pressed down' },
    { t: 2700, pose: DB_BASE, cue: 'Bring them back to the middle' },
    { t: 3000, pose: DB_BASE, cue: 'Now the other side' },
    { t: 4100, pose: DB_B, cue: 'Lower the other arm and the opposite leg' },
    { t: 4500, pose: DB_B, cue: 'Keep your lower back pressed down' },
    { t: 5700, pose: DB_BASE, cue: 'Bring them back to the middle' },
    { t: 6000, pose: DB_BASE, cue: 'Reset' },
  ],
};

// ---- Bird dog (side view, on hands and knees) ----
// Middle poses bend the elbow / knee first, so the hand and foot lift off the floor instead of skimming it.
const BD_REST = { torso: 77.5, head: 75, uArm: 180, fArm: 180, thigh: 180, shin: 268, ft: 270 };
const BD_MID_A = P(BD_REST, {               // near arm lifting, far leg lifting
  uArm: 135, fArm: 225, uArmF: 180, fArmF: 180,
  thighF: 225, shinF: 269, ftF: 270,
});
const BD_A = P(BD_REST, {                   // near arm forward + far leg back
  uArm: 90, fArm: 90, uArmF: 180, fArmF: 180,
  thighF: 270, shinF: 270, ftF: 270,
});
const BD_MID_B = P(BD_REST, {               // far arm lifting, near leg lifting
  uArm: 180, fArm: 180, uArmF: 135, fArmF: 225,
  thigh: 225, shin: 269, ft: 270, thighF: 180, shinF: 268, ftF: 270,
});
const BD_B = P(BD_REST, {                   // far arm forward + near leg back
  uArm: 180, fArm: 180, uArmF: 90, fArmF: 90,
  thigh: 270, shin: 270, ft: 270, thighF: 180, shinF: 268, ftF: 270,
});

export const birdDog = {
  id: 'bird-dog', name: 'Bird dog', view: 'side', duration: 6400,
  touchAny: [['handN', 'handF'], ['kneeN', 'kneeF']],
  keyframes: [
    { t: 0, pose: BD_REST, plant: 'kneeN', cue: 'Hands under shoulders, knees under hips' },
    { t: 550, pose: BD_MID_A, plant: 'kneeN', ease: 'in', cue: 'Reach one arm forward and the opposite leg back' },
    { t: 1100, pose: BD_A, plant: 'kneeN', ease: 'out', cue: 'Reach one arm forward and the opposite leg back' },
    { t: 1900, pose: BD_A, plant: 'kneeN', cue: 'Hold. Keep your hips level' },
    { t: 2450, pose: BD_MID_A, plant: 'kneeN', ease: 'in', cue: 'Return to the middle' },
    { t: 3000, pose: BD_REST, plant: 'kneeN', ease: 'out', cue: 'Return to the middle' },
    { t: 3200, pose: BD_REST, plant: 'kneeF', cue: 'Now the other side' },
    { t: 3750, pose: BD_MID_B, plant: 'kneeF', ease: 'in', cue: 'Reach the other arm forward and the opposite leg back' },
    { t: 4300, pose: BD_B, plant: 'kneeF', ease: 'out', cue: 'Reach the other arm forward and the opposite leg back' },
    { t: 5100, pose: BD_B, plant: 'kneeF', cue: 'Hold. Keep your hips level' },
    { t: 5650, pose: BD_MID_B, plant: 'kneeF', ease: 'in', cue: 'Return to the middle' },
    { t: 6200, pose: BD_REST, plant: 'kneeF', ease: 'out', cue: 'Return to the middle' },
    { t: 6400, pose: BD_REST, plant: 'kneeN', cue: 'Reset' },
  ],
};

// =====================================================================
// CONDITIONING
// =====================================================================

// ---- Modified burpee (side view): squat, hands down, STEP back to plank one foot at a time, step in, stand. No jump. ----
// The hips rise a little ("pike") while each foot swings back through the air, then lower into the plank.
// All leg angles were worked out so that the foot that is not stepping stays still, and the hands never leave the floor.
const BU_STAND = { torso: 0, head: 0, uArm: 178, fArm: 172, thigh: 180, shin: 180, ft: 90 };
const BU_CROUCH = { torso: 75, head: 88, uArm: 164, fArm: 154, thigh: 96.2, shin: 215.9, ft: 90 };
const BU_L1 = {                                    // hips rising, near foot just left the floor
  torso: 85, head: 98, uArm: 170.9, fArm: 170.6,
  thigh: 130.2, shin: 255.4, ft: -95,
  thighF: 118, shinF: 222.7, ftF: 90,
};
const BU_P1 = {                                    // hips high, near foot swung back, far foot still at the hands
  torso: 100, head: 112, uArm: 180, fArm: 180,
  thigh: 190, shin: 262, ft: -95,
  thighF: 138.4, shinF: 222.8, ftF: 90,
};
const BU_A = {                                     // hips lowered, near foot planted back, far foot still at the hands
  torso: 71.5, head: 75.5, uArm: 180, fArm: 180,
  thigh: 251.5, shin: 251.5, ft: 150,
  thighF: 121.6, shinF: 245.3, ftF: 90,
};
const BU_P2 = {                                    // hips high again, far foot swinging back
  torso: 100, head: 112, uArm: 180, fArm: 180,
  thigh: 238.2, shin: 238.2, ft: 150,
  thighF: 190, shinF: 262, ftF: -95,
};
const BU_PLANK = { torso: 71.5, head: 75.5, uArm: 180, fArm: 180, thigh: 251.5, shin: 251.5, ft: 150 };

export const modifiedBurpee = {
  id: 'modified-burpee', name: 'Modified burpee', view: 'side', duration: 6800,
  touch: [['handN', 1000, 4400]],
  keyframes: [
    { t: 0, pose: BU_STAND, plant: 'ankleN', cue: 'Stand tall' },
    { t: 900, pose: BU_CROUCH, plant: 'ankleN', cue: 'Squat down and place your hands on the floor' },
    { t: 1000, pose: BU_CROUCH, plant: 'handN', cue: 'Squat down and place your hands on the floor' },
    { t: 1300, pose: BU_L1, plant: 'handN', cue: 'Lift your hips and step one foot back' },
    { t: 1650, pose: BU_P1, plant: 'handN', cue: 'Lift your hips and step one foot back' },
    { t: 2050, pose: BU_A, plant: 'handN', cue: 'Place it down, then step the other foot back' },
    { t: 2450, pose: BU_P2, plant: 'handN', cue: 'Step the other foot back' },
    { t: 2850, pose: BU_PLANK, plant: 'handN', cue: 'Plank: body in one straight line' },
    { t: 3400, pose: BU_PLANK, plant: 'handN', cue: 'Hold the plank for a moment' },
    { t: 3800, pose: BU_P2, plant: 'handN', cue: 'Step one foot back in' },
    { t: 4200, pose: BU_A, plant: 'handN', cue: 'Step one foot back in' },
    { t: 4600, pose: BU_P1, plant: 'handN', cue: 'Step the other foot in' },
    { t: 4950, pose: BU_L1, plant: 'handN', cue: 'Step the other foot in' },
    { t: 5250, pose: BU_CROUCH, plant: 'handN', cue: 'Feet back under you, hands still on the floor' },
    { t: 5350, pose: BU_CROUCH, plant: 'ankleN', cue: 'Feet back under you, hands still on the floor' },
    { t: 6150, pose: BU_STAND, plant: 'ankleN', cue: 'Stand up tall' },
    { t: 6800, pose: BU_STAND, plant: 'ankleN', cue: 'Reset' },
  ],
};

// ---- Jumping jacks (front view) ----
const JJ_CLOSED = { torso: 0, head: 0, uArm: 172, fArm: 172, thigh: 180, shin: 180, ft: 90 };
const JJ_MID = { torso: 0, head: 0, uArm: 96, fArm: 94, thigh: 170, shin: 170, ft: 90, air: 0.04 };
const JJ_OPEN = { torso: 0, head: 0, uArm: 22, fArm: 16, thigh: 158, shin: 158, ft: 90 };

export const jumpingJack = {
  id: 'jumping-jack', name: 'Jumping jacks', view: 'front', duration: 1000,
  keyframes: [
    { t: 0, pose: JJ_CLOSED, cue: 'Feet together, arms by your sides' },
    { t: 250, pose: JJ_MID, ease: 'linear', cue: 'Jump feet apart, arms up' },
    { t: 500, pose: JJ_OPEN, ease: 'out', cue: 'Land softly, arms overhead' },
    { t: 750, pose: JJ_MID, ease: 'linear', cue: 'Jump feet together, arms down' },
    { t: 1000, pose: JJ_CLOSED, ease: 'out', cue: 'Land softly' },
  ],
};

// ---- Step jacks (front view): same as jumping jacks, but you STEP one foot out. No jump. ----
// A middle pose lifts the stepping foot first, so it does not drag along the floor.
const SJ_MID_N = { torso: 0, head: 0, uArm: 96, fArm: 94, thigh: 150, shin: 205, ft: 90, thighF: 180, shinF: 180 };
const SJ_NEAR = { torso: 0, head: 0, uArm: 22, fArm: 16, thigh: 158, shin: 158, ft: 90, thighF: 180, shinF: 180 };
const SJ_MID_F = { torso: 0, head: 0, uArm: 96, fArm: 94, thigh: 180, shin: 180, ft: 90, thighF: 150, shinF: 205 };
const SJ_FAR = { torso: 0, head: 0, uArm: 22, fArm: 16, thigh: 180, shin: 180, ft: 90, thighF: 158, shinF: 158 };

export const stepJack = {
  id: 'step-jack', name: 'Step jacks', view: 'front', duration: 3000,
  keyframes: [
    { t: 0, pose: JJ_CLOSED, cue: 'Feet together, arms by your sides' },
    { t: 250, pose: SJ_MID_N, ease: 'in', cue: 'Step one foot out and reach your arms up' },
    { t: 550, pose: SJ_NEAR, ease: 'out', cue: 'Step one foot out and reach your arms up' },
    { t: 900, pose: SJ_NEAR, cue: 'Arms overhead' },
    { t: 1200, pose: SJ_MID_N, ease: 'in', cue: 'Step back in, arms down' },
    { t: 1450, pose: JJ_CLOSED, ease: 'out', cue: 'Step back in, arms down' },
    { t: 1700, pose: SJ_MID_F, ease: 'in', cue: 'Now step the other foot out and reach up' },
    { t: 2000, pose: SJ_FAR, ease: 'out', cue: 'Now step the other foot out and reach up' },
    { t: 2300, pose: SJ_FAR, cue: 'Arms overhead' },
    { t: 2600, pose: SJ_MID_F, ease: 'in', cue: 'Step back in, arms down' },
    { t: 3000, pose: JJ_CLOSED, ease: 'out', cue: 'Step back in, arms down' },
  ],
};

// ---- Mountain climber (side view, high plank, hands on the floor) ----
// The legs swap through a middle pose where the hips lift a little, so the knees clear the floor.
const MC_BASE = { torso: 71.5, head: 75.5, uArm: 180, fArm: 180 };
const MC_A = P(MC_BASE, { thigh: 112, shin: 245, ft: -110, thighF: 251.5, shinF: 251.5, ftF: 150 });
const MC_B = P(MC_BASE, { thighF: 112, shinF: 245, ftF: -110, thigh: 251.5, shin: 251.5, ft: 150 });
const MC_MID = { torso: 84, head: 90, uArm: 180, fArm: 180, thigh: 185, shin: 275, ft: -110, thighF: 185, shinF: 275, ftF: -110 };   // hips bounce up a little while the legs swap

export const mountainClimber = {
  id: 'mountain-climber', name: 'Mountain climber', view: 'side', duration: 900,
  touch: ['handN'],
  keyframes: [
    { t: 0, pose: MC_A, plant: 'handN', ease: 'out', cue: 'Strong plank, drive one knee towards your chest' },
    { t: 225, pose: MC_MID, plant: 'handN', ease: 'linear', cue: 'Switch legs quickly, keep your hips low' },
    { t: 450, pose: MC_B, plant: 'handN', ease: 'out', cue: 'Strong plank, drive one knee towards your chest' },
    { t: 675, pose: MC_MID, plant: 'handN', ease: 'linear', cue: 'Switch legs quickly, keep your hips low' },
    { t: 900, pose: MC_A, plant: 'handN', ease: 'out', cue: 'Strong plank, drive one knee towards your chest' },
  ],
};

// ---- Standing mountain climber (side view). Low impact: stand tall, hands forward, knees drive up. ----
const SM_STAND = { torso: 12, head: 10, uArm: 105, fArm: 70, thigh: 180, shin: 180, ft: 90 };
const SM_LIFT = P(SM_STAND, { thigh: 150, shin: 205, ft: 100, thighF: 180, shinF: 180, ftF: 90 });
const SM_A = P(SM_STAND, { thigh: 95, shin: 185, ft: 130, thighF: 180, shinF: 180, ftF: 90 });
const SM_LIFT_B = P(SM_STAND, { thighF: 150, shinF: 205, ftF: 100 });
const SM_B = P(SM_STAND, { thighF: 95, shinF: 185, ftF: 130 });

export const standingMountainClimber = {
  id: 'standing-mountain-climber', name: 'Standing mountain climber', view: 'side', duration: 2000,
  keyframes: [
    { t: 0, pose: SM_STAND, plant: 'ankleF', cue: 'Stand tall, hands out in front of your chest' },
    { t: 180, pose: SM_LIFT, plant: 'ankleF', ease: 'in', cue: 'Lift one knee towards your chest' },
    { t: 450, pose: SM_A, plant: 'ankleF', ease: 'out', cue: 'Lift one knee towards your chest' },
    { t: 720, pose: SM_LIFT, plant: 'ankleF', ease: 'in', cue: 'Lower it and switch' },
    { t: 1000, pose: SM_STAND, plant: 'ankleN', ease: 'out', cue: 'Lower it and switch' },
    { t: 1180, pose: SM_LIFT_B, plant: 'ankleN', ease: 'in', cue: 'Lift the other knee' },
    { t: 1450, pose: SM_B, plant: 'ankleN', ease: 'out', cue: 'Lift the other knee' },
    { t: 1720, pose: SM_LIFT_B, plant: 'ankleN', ease: 'in', cue: 'Lower it and switch' },
    { t: 2000, pose: SM_STAND, plant: 'ankleN', ease: 'out', cue: 'Lower it and switch' },
  ],
};

// ---- High knees (side view): knees to hip height, quick light hops, arms pump ----
const HK_A = {
  torso: 4, head: 4,
  thigh: 85, shin: 175, ft: 120,           // near knee up
  thighF: 178, shinF: 182, ftF: 90,        // far leg on the floor
  uArm: 230, fArm: 140, uArmF: 55, fArmF: 15,
};
const HK_B = {
  torso: 4, head: 4,
  thighF: 85, shinF: 175, ftF: 120,
  thigh: 178, shin: 182, ft: 90,
  uArmF: 230, fArmF: 140, uArm: 55, fArm: 15,
};
const HK_MID = {
  torso: 4, head: 4, air: 0.035,
  thigh: 150, shin: 190, ft: 110, thighF: 150, shinF: 190, ftF: 110,
  uArm: 140, fArm: 80, uArmF: 140, fArmF: 80,
};

export const highKnees = {
  id: 'high-knees', name: 'High knees', view: 'side', duration: 800,
  keyframes: [
    { t: 0, pose: HK_A, ease: 'out', cue: 'Drive your knees up to hip height' },
    { t: 200, pose: HK_MID, ease: 'linear', cue: 'Stay light on your feet, pump your arms' },
    { t: 400, pose: HK_B, ease: 'out', cue: 'Drive your knees up to hip height' },
    { t: 600, pose: HK_MID, ease: 'linear', cue: 'Stay light on your feet, pump your arms' },
    { t: 800, pose: HK_A, ease: 'out', cue: 'Drive your knees up to hip height' },
  ],
};

// ---- Marching in place (side view): lift each knee, arms swing, no hop ----
// The knee bends first (mid pose) so the foot lifts straight up instead of dragging along the floor.
const MA_STAND = { torso: 0, head: 0, uArm: 178, fArm: 172, thigh: 180, shin: 180, ft: 90 };
const MA_LIFT = P(MA_STAND, { thigh: 150, shin: 205, ft: 100, thighF: 180, shinF: 180, ftF: 90, uArm: 197, fArm: 181, uArmF: 159, fArmF: 136 });
const MA_A = P(MA_STAND, { thigh: 100, shin: 185, ft: 120, thighF: 180, shinF: 180, ftF: 90, uArm: 215, fArm: 190, uArmF: 140, fArmF: 100 });
const MA_LIFT_B = P(MA_STAND, { thighF: 150, shinF: 205, ftF: 100, uArmF: 197, fArmF: 181, uArm: 159, fArm: 136 });
const MA_B = P(MA_STAND, { thighF: 100, shinF: 185, ftF: 120, uArmF: 215, fArmF: 190, uArm: 140, fArm: 100 });

export const marching = {
  id: 'marching', name: 'Marching in place', view: 'side', duration: 2800,
  keyframes: [
    { t: 0, pose: MA_STAND, plant: 'ankleF', cue: 'Stand tall, relaxed shoulders' },
    { t: 250, pose: MA_LIFT, plant: 'ankleF', ease: 'in', cue: 'Lift one knee, swing the opposite arm' },
    { t: 650, pose: MA_A, plant: 'ankleF', ease: 'out', cue: 'Lift one knee, swing the opposite arm' },
    { t: 1050, pose: MA_LIFT, plant: 'ankleF', ease: 'in', cue: 'Place your foot down gently' },
    { t: 1400, pose: MA_STAND, plant: 'ankleN', ease: 'out', cue: 'Place your foot down gently' },
    { t: 1650, pose: MA_LIFT_B, plant: 'ankleN', ease: 'in', cue: 'Lift the other knee, swing the opposite arm' },
    { t: 2050, pose: MA_B, plant: 'ankleN', ease: 'out', cue: 'Lift the other knee, swing the opposite arm' },
    { t: 2450, pose: MA_LIFT_B, plant: 'ankleN', ease: 'in', cue: 'Place your foot down gently' },
    { t: 2800, pose: MA_STAND, plant: 'ankleN', ease: 'out', cue: 'Place your foot down gently' },
  ],
};

// ---- Jogging in place (side view): light hops, heels kick back, arms bent ----
const JG_A = {
  torso: 6, head: 6,
  thigh: 125, shin: 200, ft: 120,              // near knee forward
  thighF: 188, shinF: 235, ftF: 140,           // far heel kicks back
  uArm: 225, fArm: 130, uArmF: 60, fArmF: 20,
};
const JG_B = {
  torso: 6, head: 6,
  thighF: 125, shinF: 200, ftF: 120,
  thigh: 188, shin: 235, ft: 140,
  uArmF: 225, fArmF: 130, uArm: 60, fArm: 20,
};
const JG_MID = {
  torso: 6, head: 6, air: 0.03,
  thigh: 160, shin: 215, ft: 120, thighF: 160, shinF: 215, ftF: 120,
  uArm: 140, fArm: 80, uArmF: 140, fArmF: 80,
};

export const jogging = {
  id: 'jogging', name: 'Jogging in place', view: 'side', duration: 1000,
  keyframes: [
    { t: 0, pose: JG_A, ease: 'out', cue: 'Light, easy steps. Land softly' },
    { t: 250, pose: JG_MID, ease: 'linear', cue: 'Keep your arms bent, breathe steadily' },
    { t: 500, pose: JG_B, ease: 'out', cue: 'Light, easy steps. Land softly' },
    { t: 750, pose: JG_MID, ease: 'linear', cue: 'Keep your arms bent, breathe steadily' },
    { t: 1000, pose: JG_A, ease: 'out', cue: 'Light, easy steps. Land softly' },
  ],
};

// =====================================================================
// RECOVERY
// =====================================================================

// ---- Walking (side view). The floor slides backwards, as on a treadmill, so the feet do not skate. ----
// The foot path is built from numbers (not hand-picked angles): while a foot is on the floor it moves
// backwards at a constant speed, and the floor scrolls at exactly that speed.
const WALK = { cycle: 1600, stance: 0.6, reach: 0.155, hipToFloor: 0.47, clearance: 0.12, step: 100 };
const _deg = r => (r * 180) / Math.PI;
// 2-link leg solver: returns [thigh, shin] angles for an ankle at (x, y) relative to the hip, knee forward.
function legAngles(x, y) {
  const L = 0.245, d = Math.min(Math.hypot(x, y), 2 * L - 1e-6);
  const a = Math.acos(d / (2 * L)), base = Math.atan2(x, y);   // angle measured like our poses (0 = up)
  const thigh = base + a, kneeX = L * Math.sin(thigh);
  const alt = base - a;
  const t = (L * Math.sin(alt) > kneeX) ? alt : thigh;         // choose the solution with the knee in front
  const kx = L * Math.sin(t), ky = L * Math.cos(t);
  const norm = a => ((a % 360) + 360) % 360;                   // keep angles continuous (0..360)
  return [norm(_deg(t)), norm(_deg(Math.atan2(x - kx, y - ky)))];
}
// Where one leg is at phase p (0..1): p = 0 is heel strike. Returns {x, y, ft} for the ankle relative to the hip.
function walkLeg(p) {
  const { stance, reach, hipToFloor, clearance } = WALK;
  const ankleFloor = 0.025;
  if (p < stance) {
    const u = p / stance;
    const x = reach - 2 * reach * u;                                   // constant backwards speed
    const ft = u < 0.15 ? 65 + (90 - 65) * (u / 0.15) : u < 0.8 ? 90 : 90 + 60 * ((u - 0.8) / 0.2);
    const lift = Math.max(0, -0.085 * Math.cos((ft * Math.PI) / 180));  // heel rises, toe stays down
    return { x, y: ankleFloor + lift - hipToFloor, ft };
  }
  const u = (p - stance) / (1 - stance);
  const x = -reach + 2 * reach * (0.5 - 0.5 * Math.cos(Math.PI * u));  // swing forward
  const y = ankleFloor + 0.0736 + (clearance - 0.0736) * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (u < 0.87 ? 1 : (1 - u) / 0.13) - hipToFloor;
  const ft = 150 + (65 - 150) * Math.min(1, u * 1.1);
  return { x, y: u > 0.9 ? Math.min(y, ankleFloor - hipToFloor + 0.01 + (1 - u) * 0.6) : y, ft };
}
function walkPose(tms) {
  const near = walkLeg((tms / WALK.cycle) % 1);
  const far = walkLeg(((tms / WALK.cycle) + 0.5) % 1);
  const [th, sh] = legAngles(near.x, near.y), [thF, shF] = legAngles(far.x, far.y);
  const th_ = (tms / WALK.cycle) * 2 * Math.PI;
  const arm = (c) => { const u = 180 + 25 * c, f = u - 22 * Math.max(0, -c); return [u, f]; };
  const [u, f] = arm(Math.cos(th_)), [uF, fF] = arm(-Math.cos(th_));
  return { torso: 2, head: 2, thigh: th, shin: sh, ft: near.ft, thighF: thF, shinF: shF, ftF: far.ft,
    uArm: u, fArm: f, uArmF: uF, fArmF: fF };
}
const walkKeyframes = [];
for (let t = 0; t <= WALK.cycle; t += WALK.step) {
  walkKeyframes.push({ t, pose: walkPose(t), ease: 'linear',
    cue: t < 800 ? 'Tall posture, relaxed shoulders' : 'Heel down first, then roll through the foot. Swing your arms' });
}

export const walking = {
  id: 'walking', name: 'Walking', view: 'side', duration: WALK.cycle,
  scrollDist: (2 * WALK.reach / WALK.stance) * 1.0,   // floor distance per cycle = stance speed x cycle time
  keyframes: walkKeyframes,
};

// ---- Gentle stretching (front view): reach up and lean gently to each side ----
const GS_UP = { torso: 0, head: 0, uArm: 10, fArm: 6, thigh: 173, shin: 173, ft: 90 };
const GS_R = { torso: 14, head: 14, uArm: 10, fArm: 6, uArmF: -24, fArmF: -28, thigh: 173, shin: 173, ft: 90 };
const GS_L = { torso: -14, head: -14, uArm: -24, fArm: -28, uArmF: 10, fArmF: 6, thigh: 173, shin: 173, ft: 90 };

export const gentleStretching = {
  id: 'gentle-stretching', name: 'Gentle stretching', view: 'front', duration: 8000,
  keyframes: [
    { t: 0, pose: GS_UP, cue: 'Stand tall and reach both arms up' },
    { t: 1500, pose: GS_R, cue: 'Lean gently to the right and breathe' },
    { t: 2600, pose: GS_R, cue: 'Hold the stretch, no bouncing' },
    { t: 4000, pose: GS_UP, cue: 'Come back to the middle' },
    { t: 5500, pose: GS_L, cue: 'Lean gently to the left and breathe' },
    { t: 6600, pose: GS_L, cue: 'Hold the stretch, no bouncing' },
    { t: 8000, pose: GS_UP, cue: 'Come back to the middle' },
  ],
};

// ---- Hip mobility (front view): lift the knee, open it out to the side, lower ----
const HM_STAND = { torso: 0, head: 0, uArm: 125, fArm: 215, thigh: 180, shin: 180, ft: 90 };
const HM_LIFT = P(HM_STAND, { torso: -2, head: -2, thigh: 150, shin: 205, ft: 90, thighF: 180, shinF: 180, ftF: 90 });
const HM_A = P(HM_STAND, { torso: -4, head: -4, thigh: 85, shin: 175, ft: 90, thighF: 180, shinF: 180, ftF: 90 });   // near knee out
const HM_LIFT_B = P(HM_STAND, { torso: 2, head: 2, thighF: 150, shinF: 205, ftF: 90 });
const HM_B = P(HM_STAND, { torso: 4, head: 4, thighF: 85, shinF: 175, ftF: 90 });                                     // far knee out

export const hipMobility = {
  id: 'hip-mobility', name: 'Hip mobility', view: 'front', duration: 6400,
  keyframes: [
    { t: 0, pose: HM_STAND, plant: 'ankleF', cue: 'Stand tall, hands on your hips' },
    { t: 500, pose: HM_LIFT, plant: 'ankleF', ease: 'in', cue: 'Lift one knee and open it out to the side' },
    { t: 1200, pose: HM_A, plant: 'ankleF', ease: 'out', cue: 'Lift one knee and open it out to the side' },
    { t: 2000, pose: HM_A, plant: 'ankleF', cue: 'Slow and controlled. Hold on to a wall if you need to' },
    { t: 2700, pose: HM_LIFT, plant: 'ankleF', ease: 'in', cue: 'Lower your foot' },
    { t: 3200, pose: HM_STAND, plant: 'ankleN', ease: 'out', cue: 'Lower your foot' },
    { t: 3700, pose: HM_LIFT_B, plant: 'ankleN', ease: 'in', cue: 'Lift the other knee and open it out' },
    { t: 4400, pose: HM_B, plant: 'ankleN', ease: 'out', cue: 'Lift the other knee and open it out' },
    { t: 5200, pose: HM_B, plant: 'ankleN', cue: 'Slow and controlled' },
    { t: 5900, pose: HM_LIFT_B, plant: 'ankleN', ease: 'in', cue: 'Lower your foot' },
    { t: 6400, pose: HM_STAND, plant: 'ankleN', ease: 'out', cue: 'Lower your foot' },
  ],
};

// ---- Shoulder mobility (side view): big slow arm circles, forward then backward ----
const SH = a => ({ torso: 0, head: 0, uArm: a, fArm: a, thigh: 180, shin: 180, ft: 90 });

export const shoulderMobility = {
  id: 'shoulder-mobility', name: 'Shoulder mobility', view: 'side', duration: 8000,
  keyframes: [
    { t: 0, pose: SH(180), ease: 'linear', cue: 'Arms by your sides, then circle them forward' },
    { t: 1000, pose: SH(90), ease: 'linear', cue: 'Big, slow circles forward' },
    { t: 2000, pose: SH(0), ease: 'linear', cue: 'Big, slow circles forward' },
    { t: 3000, pose: SH(-90), ease: 'linear', cue: 'Big, slow circles forward' },
    { t: 4000, pose: SH(-180), ease: 'linear', cue: 'Now reverse the direction' },
    { t: 5000, pose: SH(-90), ease: 'linear', cue: 'Big, slow circles backward' },
    { t: 6000, pose: SH(0), ease: 'linear', cue: 'Big, slow circles backward' },
    { t: 7000, pose: SH(90), ease: 'linear', cue: 'Big, slow circles backward' },
    { t: 8000, pose: SH(180), ease: 'linear', cue: 'Big, slow circles backward' },
  ],
};

// ---- Leg stretch (side view): standing forward fold for the back of the legs (hamstrings) ----
const LS_STAND = { torso: 0, head: 0, uArm: 178, fArm: 172, thigh: 180, shin: 180, ft: 90 };
const LS_FOLD = { torso: 108, head: 118, uArm: 180, fArm: 180, thigh: 174, shin: 183, ft: 90 };

export const legStretches = {
  id: 'leg-stretches', name: 'Leg stretch', view: 'side', duration: 6000,
  touch: ['ankleN'],
  keyframes: [
    { t: 0, pose: LS_STAND, plant: 'ankleN', cue: 'Stand tall, feet hip-width apart' },
    { t: 2200, pose: LS_FOLD, plant: 'ankleN', cue: 'Fold forward from your hips, soft knees' },
    { t: 4000, pose: LS_FOLD, plant: 'ankleN', cue: 'Hold and breathe. Let your arms hang' },
    { t: 5800, pose: LS_STAND, plant: 'ankleN', cue: 'Roll up slowly, one bone at a time' },
    { t: 6000, pose: LS_STAND, plant: 'ankleN', cue: 'Reset' },
  ],
};

// ---------------------------------------------------------------------
export const ANIMATIONS = {
  'wall-pushup': wallPushup, 'knee-pushup': kneePushup, 'pushup': pushup,
  'squat': squat, 'reverse-lunge': reverseLunge, 'glute-bridge': gluteBridge,
  'plank': plank, 'crunch': crunch, 'lying-knee-raise': lyingKneeRaise, 'dead-bug': deadBug, 'bird-dog': birdDog,
  'modified-burpee': modifiedBurpee, 'jumping-jack': jumpingJack, 'step-jack': stepJack,
  'mountain-climber': mountainClimber, 'standing-mountain-climber': standingMountainClimber,
  'high-knees': highKnees, 'marching': marching, 'jogging': jogging,
  'walking': walking, 'gentle-stretching': gentleStretching, 'hip-mobility': hipMobility,
  'shoulder-mobility': shoulderMobility, 'leg-stretches': legStretches,
};
