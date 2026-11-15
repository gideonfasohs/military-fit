// The onboarding questions (spec section 2) and the baseline items (spec section 3).
// Each option: id (saved on the phone), label (shown), icon (see js/icons.js).

export const GOALS = [
  { id: 'fat', label: 'Lose overall body fat', icon: 'fat' },
  { id: 'belly', label: 'Reduce belly fat and waist circumference', icon: 'belly' },
  { id: 'muscle', label: 'Build muscle', icon: 'workouts' },
  { id: 'lean', label: 'Develop a lean, athletic physique', icon: 'pulse' },
  { id: 'strength', label: 'Build strength', icon: 'bolt' },
  { id: 'endurance', label: 'Improve endurance and stamina', icon: 'endurance' },
  { id: 'cardio', label: 'Improve cardiovascular fitness', icon: 'heart' },
  { id: 'mobility', label: 'Improve flexibility and mobility', icon: 'mobility' },
  { id: 'general', label: 'Become generally fitter and healthier', icon: 'check' },
  { id: 'military', label: 'Prepare for military or physical fitness tests', icon: 'shield' },
  { id: 'discipline', label: 'Improve discipline and physical performance', icon: 'target' },
  { id: 'other', label: 'Other — write my own', icon: 'pencil', other: true },
];

export const CHANGES = [
  { id: 'fat', label: 'Reduce body fat', icon: 'fat' },
  { id: 'abs', label: 'Develop visible abdominal muscles', icon: 'belly' },
  { id: 'arms', label: 'Build stronger arms and shoulders', icon: 'workouts' },
  { id: 'chest', label: 'Develop a stronger chest', icon: 'shield' },
  { id: 'legs', label: 'Strengthen my legs', icon: 'walk' },
  { id: 'core', label: 'Improve core strength', icon: 'target' },
  { id: 'shape', label: 'Improve overall body shape', icon: 'pulse' },
  { id: 'stamina', label: 'Improve stamina and endurance', icon: 'endurance' },
  { id: 'stronger-light', label: 'Become stronger without necessarily gaining much weight', icon: 'bolt' },
  { id: 'health', label: 'Improve general health and physical ability', icon: 'check' },
  { id: 'else', label: 'Something else — write my own', icon: 'pencil', other: true },
];

export const LEVELS = [
  { id: 'complete-beginner', label: 'Complete beginner', icon: 'sprout' },
  { id: 'beginner', label: 'Beginner with some exercise experience', icon: 'sprout' },
  { id: 'intermediate', label: 'Intermediate', icon: 'pulse' },
  { id: 'advanced', label: 'Advanced', icon: 'bolt' },
  { id: 'returning', label: 'Returning after a long break', icon: 'repeat' },
];

export const ACTIVITY = [
  { id: 'sitting', label: 'Mostly sitting throughout the day', icon: 'home' },
  { id: 'light', label: 'Lightly active', icon: 'walk' },
  { id: 'moderate', label: 'Moderately active', icon: 'walk' },
  { id: 'very', label: 'Very active', icon: 'endurance' },
  { id: 'regular', label: 'I exercise regularly', icon: 'workouts' },
];

export const SUCCESS_EXAMPLES = [
  'I want to lose 5 kg.',
  'I want to reduce my waist measurement.',
  'I want to perform 30 proper push-ups.',
  'I want to hold a plank for two minutes.',
  'I want to run for 30 minutes without stopping.',
  'I want to develop a lean, athletic physique.',
  'I want to improve my general physical fitness.',
];

export const HORIZONS = [
  { id: '30', label: '30 days', icon: 'calendar' },
  { id: '60', label: '60 days', icon: 'calendar' },
  { id: '90', label: '90 days', icon: 'calendar' },
  { id: '180', label: '6 months', icon: 'calendar' },
  { id: 'none', label: 'No specific deadline', icon: 'clock' },
];

export const TIMES = [
  { id: '10-15', label: '10 to 15 minutes', icon: 'clock' },
  { id: '20-30', label: '20 to 30 minutes', icon: 'clock' },
  { id: '30-45', label: '30 to 45 minutes', icon: 'clock' },
  { id: '45-60', label: '45 to 60 minutes', icon: 'clock' },
  { id: '60+', label: 'More than 60 minutes', icon: 'clock' },
];

export const DAYS = [
  { id: '2', label: '2 days', icon: 'calendar' },
  { id: '3', label: '3 days', icon: 'calendar' },
  { id: '4', label: '4 days', icon: 'calendar' },
  { id: '5', label: '5 days', icon: 'calendar' },
  { id: '6', label: '6 days', icon: 'calendar' },
  { id: '7', label: 'Every day, including light recovery activities', icon: 'calendar' },
];

export const STYLES = [
  { id: 'military', label: 'Military-style calisthenics', icon: 'shield' },
  { id: 'strength', label: 'Strength training', icon: 'workouts' },
  { id: 'cardio', label: 'Cardio and endurance', icon: 'endurance' },
  { id: 'bodyweight', label: 'Bodyweight exercises', icon: 'walk' },
  { id: 'mixed', label: 'Mixed training', icon: 'repeat' },
  { id: 'flexible', label: 'Flexible — recommend what is best for my goals', icon: 'sliders' },
];

export const LIMITS = [
  { id: 'knees', label: 'Knees', icon: 'alert' },
  { id: 'lower-back', label: 'Lower back', icon: 'alert' },
  { id: 'shoulders', label: 'Shoulders', icon: 'alert' },
  { id: 'wrists', label: 'Wrists', icon: 'alert' },
  { id: 'ankles-feet', label: 'Ankles or feet', icon: 'alert' },
  { id: 'heart-bp-breathing', label: 'Heart, blood pressure or breathing condition', icon: 'heart' },
  { id: 'none', label: 'No known limitations', icon: 'check', exclusive: true },
];

export const PUSHUP_CHOICES = [
  { id: 'wall', label: 'Wall push-ups', icon: 'workouts' },
  { id: 'knee', label: 'Knee push-ups', icon: 'workouts' },
  { id: 'standard', label: 'Standard push-ups', icon: 'workouts' },
  { id: 'cannot', label: 'I cannot do any yet', icon: 'sprout' },
];

export const ENERGY = [
  { id: 1, label: 'Very low' }, { id: 2, label: 'Low' }, { id: 3, label: 'Okay' },
  { id: 4, label: 'Good' }, { id: 5, label: 'Great' },
];

export const SEX = [
  { id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }, { id: 'not-say', label: 'Prefer not to say' },
];

export const PREFERRED_TIME = [
  { id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' }, { id: 'any', label: 'No preference' },
];

// Helper: id -> label for any list
export const labelOf = (list, id) => (list.find(o => o.id === id) || {}).label || null;
