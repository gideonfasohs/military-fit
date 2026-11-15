// Pose data for the animated figures. Angles: 0 = up, 90 = forward, 180 = down, 270 = back.
// See the comment at the top of js/anim.js.

const P = (base, o) => ({ ...base, ...o });

// ---- Bodyweight squat (side view) ----
const SQ_STAND = { torso: 0, head: 0, uArm: 178, fArm: 175, thigh: 180, shin: 180, ft: 90 };
const SQ_DOWN = { torso: 38, head: 18, uArm: 92, fArm: 88, thigh: 100, shin: 213, ft: 90 };

export const squat = {
  id: 'squat', name: 'Bodyweight squat', view: 'side', duration: 4200,
  keyframes: [
    { t: 0, pose: SQ_STAND, plant: 'ankleN', cue: 'Stand tall, feet shoulder-width apart' },
    { t: 1600, pose: SQ_DOWN, plant: 'ankleN', cue: 'Sit hips back and down, chest up' },
    { t: 2100, pose: SQ_DOWN, plant: 'ankleN', cue: 'Pause at the bottom' },
    { t: 3700, pose: SQ_STAND, plant: 'ankleN', cue: 'Push through your heels and stand tall' },
    { t: 4200, pose: SQ_STAND, plant: 'ankleN', cue: 'Reset' },
  ],
};

// ---- Push-up (side view) ----
const PU_UP = { torso: 72, head: 76, uArm: 180, fArm: 180, thigh: 252, shin: 252, ft: 150 };
const PU_DOWN = { torso: 84, head: 86, uArm: 262, fArm: 150, thigh: 264, shin: 264, ft: 150 };

const PU_MID = { torso: 76, head: 78, uArm: 225, fArm: 165, thigh: 256, shin: 256, ft: 150 };

export const pushup = {
  id: 'pushup', name: 'Push-up', view: 'side', duration: 4200,
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

export const ANIMATIONS = { squat, pushup, jumpingJack };
